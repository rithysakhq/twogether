import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Palette } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';

// Dummy data
const PROMPT = 'If we could teleport anywhere right now, where would we go?';
const MY_ANSWER = 'Tokyo';
const PARTNER_ANSWER = 'Paris';
const STREAK = 5;

export default function TodayScreen() {
  const [inputText, setInputText] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const [uiState, setUiState] = useState<'unanswered' | 'waiting' | 'revealed'>('unanswered');
  const scheme = useColorScheme() ?? 'dark';
  const palette = Colors[scheme];
  const styles = createStyles(palette);

  useEffect(() => {
    async function fetchTodayState() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('responses')
          .select('id')
          .eq('user_id', user.id)
          .eq('answered_date', today)
          .maybeSingle();

        if (error) {
          console.error('Failed to fetch today response:', error);
          return;
        }
        setUiState(data ? 'waiting' : 'unanswered');
      } catch (err) {
        console.error('Unexpected error fetching today state:', err);
      }
    }
    fetchTodayState();
  }, []);

  async function handleSubmitAnswer() {
    if (!inputText.trim()) return;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Failed to get user:', userError);
        return;
      }
      const { error } = await supabase.from('responses').insert({
        user_id: user.id,
        prompt_text: PROMPT,
        answer_text: inputText.trim(),
        answered_date: new Date().toISOString().split('T')[0],
      });
      if (error) {
        console.error('Failed to submit answer:', error);
        return;
      }
      setMyAnswer(inputText.trim());
      setInputText('');
      setUiState('waiting');
    } catch (err) {
      console.error('Unexpected error in handleSubmitAnswer:', err);
    }
  }

  async function handleTestOnboarding() {
    try {
      let { error } = await supabase.auth.signInWithPassword({
        email: 'test@twogether.com',
        password: 'password123',
      });
      if (error) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'test@twogether.com',
          password: 'password123',
        });
        if (signUpError) {
          console.error('Auth failed:', signUpError);
          return;
        }
      }
      router.push('/onboarding');
    } catch (err) {
      console.error('Unexpected error in handleTestOnboarding:', err);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header: streak */}
          <View style={styles.headerRow}>
            <Text style={styles.streakLabel}>{STREAK} day streak</Text>
          </View>

          {/* Question card */}
          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>Today's question</Text>
            <Text style={styles.questionText}>{PROMPT}</Text>
          </View>

          {/* Unanswered state */}
          {uiState === 'unanswered' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Type your answer..."
                placeholderTextColor={palette.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
                autoCorrect
                returnKeyType="default"
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmitAnswer}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Submit Answer</Text>
              </TouchableOpacity>

              {/* OR divider */}
              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.orLine} />
              </View>

              {/* Hold to Record */}
              <TouchableOpacity style={styles.voiceButton} activeOpacity={0.85}>
                <Text style={styles.voiceButtonText}>⏺  Hold to Record</Text>
              </TouchableOpacity>

              {/* DEV ONLY */}
              <TouchableOpacity
                style={styles.devButton}
                onPress={handleTestOnboarding}
                activeOpacity={0.8}
              >
                <Text style={styles.devButtonText}>DEV: Login & Onboarding</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Waiting state */}
          {uiState === 'waiting' && (
            <>
              <View style={styles.waitingAnswerCard}>
                <Text style={styles.answerCardLabel}>Your answer</Text>
                <Text style={styles.waitingAnswerText}>{myAnswer}</Text>
              </View>
              <View style={styles.partnerWaitingCard}>
                <Text style={styles.answerCardLabel}>Partner</Text>
                <Text style={styles.partnerWaitingText}>
                  🔒 Waiting for their response...
                </Text>
              </View>
            </>
          )}

          {/* Revealed state */}
          {uiState === 'revealed' && (
            <>
              <View style={styles.answerCard}>
                <Text style={styles.answerCardLabel}>You</Text>
                <Text style={styles.answerText}>{MY_ANSWER}</Text>
              </View>
              <View style={styles.answerCard}>
                <Text style={styles.answerCardLabel}>Partner</Text>
                <Text style={styles.answerText}>{PARTNER_ANSWER}</Text>
                <TouchableOpacity style={styles.listenButton} activeOpacity={0.85}>
                  <Text style={styles.listenButtonText}>🔊  Hold to Listen</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: c.background,
    },
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    scroll: {
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 48,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    streakLabel: {
      color: c.textMuted,
      fontSize: 13,
      fontWeight: 'bold',
      letterSpacing: -0.3,
    },
    questionCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
    },
    questionLabel: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 10,
    },
    questionText: {
      color: c.text,
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
      letterSpacing: -0.3,
    },
    input: {
      backgroundColor: c.card,
      color: c.text,
      borderRadius: 12,
      minHeight: 80,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      lineHeight: 22,
      marginBottom: 12,
      textAlignVertical: 'top',
    },
    button: {
      backgroundColor: Colors.primary,
      borderRadius: 12,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDisabled: {
      opacity: 0.4,
    },
    buttonText: {
      // Always white — text sits on the neon-pink primary, which is shared across themes.
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    orRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    orLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.card,
    },
    orText: {
      color: c.textMuted,
      fontSize: 12,
      fontWeight: '600',
      marginHorizontal: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    voiceButton: {
      backgroundColor: c.card,
      borderRadius: 12,
      minHeight: 72,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.primary,
    },
    voiceButtonText: {
      color: Colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 0.3,
    },
    waitingAnswerCard: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      opacity: 0.45,
    },
    partnerWaitingCard: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
    },
    partnerWaitingText: {
      color: c.textMuted,
      fontSize: 16,
      lineHeight: 22,
    },
    answerCardLabel: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
    },
    waitingAnswerText: {
      color: c.text,
      fontSize: 16,
      lineHeight: 22,
    },
    answerCard: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
    },
    answerText: {
      color: c.text,
      fontSize: 16,
      lineHeight: 22,
      marginBottom: 12,
    },
    listenButton: {
      backgroundColor: c.card,
      borderRadius: 12,
      minHeight: 56,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.primary,
      marginTop: 4,
    },
    listenButtonText: {
      color: Colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 0.3,
    },
    devButton: {
      borderRadius: 12,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      borderWidth: 1,
      borderColor: c.textMuted,
      opacity: 0.5,
    },
    devButtonText: {
      color: c.textMuted,
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
  });
