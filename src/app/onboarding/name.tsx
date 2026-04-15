import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Palette } from '../../constants/Colors';
import ProgressBar from '../../components/ProgressBar';
import { supabase } from '../../lib/supabase';

export default function NameScreen() {
  const [name, setName] = useState('');
  const scheme = useColorScheme() ?? 'dark';
  const palette = Colors[scheme];
  const styles = createStyles(palette);
  const router = useRouter();

  async function handleContinue() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Failed to get user:', userError);
        return;
      }
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: name.trim(),
        onboarding_completed: false,
      });
      if (error) {
        console.error('Failed to save name:', error);
        return;
      }
      router.push('/onboarding/notifications');
    } catch (err) {
      console.error('Unexpected error in handleContinue:', err);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={palette.text} />
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressBar progress={0.33} />
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.headline}>What should your partner call you?</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name..."
            placeholderTextColor={palette.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
          />
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, !name.trim() && styles.buttonDisabled]}
            disabled={!name.trim()}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
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
    backButton: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 4,
      alignSelf: 'flex-start',
      minHeight: 44,
      justifyContent: 'center',
    },
    progressWrapper: {
      paddingHorizontal: 24,
      marginTop: 16,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
    },
    headline: {
      color: c.text,
      fontSize: 28,
      fontWeight: 'bold',
      letterSpacing: -0.5,
      marginBottom: 24,
    },
    input: {
      backgroundColor: c.card,
      color: c.text,
      borderRadius: 16,
      fontSize: 20,
      fontWeight: '600',
      paddingHorizontal: 20,
      paddingVertical: 16,
      minHeight: 64,
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 16,
      paddingTop: 12,
    },
    primaryButton: {
      backgroundColor: Colors.primary,
      borderRadius: 16,
      minHeight: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDisabled: {
      opacity: 0.4,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: 'bold',
    },
  });
