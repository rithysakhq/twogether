import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { supabase } from '../lib/supabase';
import {
  requestMicrophonePermission,
  startRecording,
  stopRecording,
} from '../utils/AudioService';
import SettingsScreen from './SettingsScreen';
import PaywallScreen from './PaywallScreen';

type Props = {
  userId: string;
  pairId: string;
  pairCode: string;
  isPremium: boolean;
  onPremiumUnlocked: () => void;
};

type Prompt = {
  id: string;
  question_text: string;
};

type HistoryRow = {
  user_id: string;
  answer_text: string;
  prompts: { active_date: string; question_text: string };
};

type Memory = {
  date: string;
  question: string;
  myAnswer: string;
  partnerAnswer: string;
};

const computeStreak = (rows: HistoryRow[], userId: string, partnerId: string): number => {
  const dateMap = new Map<string, Set<string>>();
  for (const row of rows) {
    const date = row.prompts?.active_date;
    if (!date) continue;
    if (!dateMap.has(date)) dateMap.set(date, new Set());
    dateMap.get(date)!.add(row.user_id);
  }

  const bothDates = [...dateMap.entries()]
    .filter(([, users]) => users.has(userId) && users.has(partnerId))
    .map(([date]) => date)
    .sort()
    .reverse();

  const today = new Date().toISOString().split('T')[0];
  let count = 0;
  let expected = today;
  for (const date of bothDates) {
    if (date === expected) {
      count++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split('T')[0];
    } else {
      break;
    }
  }
  return count;
};

const buildMemories = (
  rows: HistoryRow[],
  userId: string,
  partnerId: string,
  today: string
): Memory[] => {
  const byDate = new Map<string, { mine?: string; theirs?: string; question: string }>();
  for (const row of rows) {
    const date = row.prompts?.active_date;
    if (!date || date === today) continue;
    if (!byDate.has(date)) byDate.set(date, { question: row.prompts.question_text });
    const entry = byDate.get(date)!;
    if (row.user_id === userId) entry.mine = row.answer_text;
    else entry.theirs = row.answer_text;
  }
  return [...byDate.entries()]
    .filter(([, e]) => e.mine && e.theirs)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7)
    .map(([date, e]) => ({
      date,
      question: e.question,
      myAnswer: e.mine!,
      partnerAnswer: e.theirs!,
    }));
};

const formatDate = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function HomeScreen({ userId, pairId, pairCode, isPremium, onPremiumUnlocked }: Props) {
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [streak, setStreak] = useState(0);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeRecording, setActiveRecording] = useState<Audio.Recording | null>(null);
  const [voiceError, setVoiceError] = useState('');
  const [partnerAudioUrl, setPartnerAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep partnerId in a ref for the Realtime callback closure
  const partnerIdRef = useRef<string | null>(null);
  useEffect(() => {
    partnerIdRef.current = partnerId;
  }, [partnerId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Find partner's user ID
      const { data: partnerRow } = await supabase
        .from('profiles')
        .select('id')
        .eq('pair_id', pairId)
        .neq('id', userId)
        .limit(1)
        .single();

      const pid = partnerRow?.id ?? null;
      setPartnerId(pid);
      partnerIdRef.current = pid;

      // 2. Today's prompt
      const today = new Date().toISOString().split('T')[0];
      const { data: promptRow } = await supabase
        .from('prompts')
        .select('id, question_text')
        .eq('active_date', today)
        .limit(1)
        .single();

      setPrompt(promptRow ?? null);

      if (!promptRow || !pid) return;

      // 3. Existing answers for today's prompt
      const { data: answerRows } = await supabase
        .from('answers')
        .select('user_id, answer_text, audio_url')
        .eq('prompt_id', promptRow.id)
        .in('user_id', [userId, pid]);

      for (const row of answerRows ?? []) {
        if (row.user_id === userId) {
          setMyAnswer(row.answer_text);
        } else {
          setPartnerAnswer(row.answer_text);
          setPartnerAudioUrl(row.audio_url ?? null);
        }
      }

      // 4. History — feeds both streak + memories gallery
      const { data: historyRows } = await supabase
        .from('answers')
        .select('user_id, answer_text, prompts!inner(active_date, question_text)')
        .in('user_id', [userId, pid]);

      const rows = (historyRows as unknown as HistoryRow[]) ?? [];
      setStreak(computeStreak(rows, userId, pid));
      setMemories(buildMemories(rows, userId, pid, today));
    } finally {
      setLoading(false);
    }
  }, [userId, pairId]);

  // Subscribe to Realtime after prompt is loaded
  useEffect(() => {
    if (!prompt) return;

    const channel = supabase
      .channel(`answers-${prompt.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'answers',
          filter: `prompt_id=eq.${prompt.id}`,
        },
        (payload: { new: { user_id: string; answer_text: string; audio_url?: string } }) => {
          if (payload.new.user_id === partnerIdRef.current) {
            setPartnerAnswer(payload.new.answer_text);
            setPartnerAudioUrl(payload.new.audio_url ?? null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [prompt]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Re-compute streak + memories when both have answered today
  useEffect(() => {
    if (!myAnswer || !partnerAnswer || !partnerId) return;
    const today = new Date().toISOString().split('T')[0];
    supabase
      .from('answers')
      .select('user_id, answer_text, prompts!inner(active_date, question_text)')
      .in('user_id', [userId, partnerId])
      .then(({ data }) => {
        if (data) {
          const rows = data as unknown as HistoryRow[];
          setStreak(computeStreak(rows, userId, partnerId));
          setMemories(buildMemories(rows, userId, partnerId, today));
        }
      });
  }, [myAnswer, partnerAnswer, userId, partnerId]);

  // Cleanup sound on unmount to prevent background audio ghosts
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, []);

  const handleListenPressIn = async () => {
    if (!partnerAudioUrl) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setIsBuffering(true);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri: partnerAudioUrl },
        { shouldPlay: true },
      );
      soundRef.current = sound;
      setIsBuffering(false);
      setIsPlaying(true);

      // Heartbeat haptic while playing
      heartbeatRef.current = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }, 1000);

      // Auto-cleanup when audio finishes naturally
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
          }
          sound.unloadAsync();
          soundRef.current = null;
          setIsPlaying(false);
        }
      });
    } catch {
      setIsBuffering(false);
    }
  };

  const handleListenPressOut = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setIsPlaying(false);
    setIsBuffering(false);
  };

  const handlePressIn = async () => {
    if (!prompt) return;
    setVoiceError('');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const granted = await requestMicrophonePermission();
    if (!granted) {
      setVoiceError('Microphone permission denied.');
      return;
    }
    const recording = await startRecording();
    setActiveRecording(recording);
    setIsRecording(true);
  };

  const handlePressOut = async () => {
    if (!activeRecording || !prompt) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRecording(false);
    setUploading(true);
    try {
      const uri = await stopRecording(activeRecording);
      setActiveRecording(null);

      const response = await fetch(uri);
      const blob = await response.blob();
      const path = `${userId}/${prompt.id}_${Date.now()}.m4a`;

      const { error: uploadError } = await supabase.storage
        .from('voice_prompts')
        .upload(path, blob, { contentType: 'audio/m4a' });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('voice_prompts')
        .getPublicUrl(path);

      const { error: insertError } = await supabase.from('answers').insert({
        user_id: userId,
        prompt_id: prompt.id,
        answer_text: '',
        audio_url: urlData.publicUrl,
      });
      if (insertError) throw insertError;

      setMyAnswer('🎤 Voice message');
    } catch (err: any) {
      setVoiceError(err.message ?? 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim() || !prompt) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      const { error } = await supabase.from('answers').insert({
        user_id: userId,
        prompt_id: prompt.id,
        answer_text: inputText.trim(),
      });
      if (error) throw error;
      setMyAnswer(inputText.trim());
    } catch (err: any) {
      setSubmitError(err.message ?? 'Failed to submit. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Derived state
  const answerState: 'unanswered' | 'waiting' | 'revealed' =
    !myAnswer ? 'unanswered' : !partnerAnswer ? 'waiting' : 'revealed';

  const streakColor = answerState === 'revealed' && streak > 0 ? '#00E59B' : '#8E8E93';
  const streakSize = answerState === 'revealed' && streak > 0 ? 18 : 13;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#FF2A5F" style={styles.loadingIndicator} />
      </SafeAreaView>
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header: streak + gear */}
            <View style={styles.headerRow}>
              <Text style={[styles.streakLabel, { color: streakColor, fontSize: streakSize }]}>
                {streak} day streak
              </Text>
              <TouchableOpacity
                style={styles.gearHit}
                onPress={() => setShowSettings(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.gearIcon}>⚙</Text>
              </TouchableOpacity>
            </View>

            {/* No prompt today */}
            {!prompt ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No question today.</Text>
                <Text style={styles.emptySubtext}>Check back tomorrow.</Text>
              </View>
            ) : (
              <>
                {/* Question card */}
                <View style={styles.questionCard}>
                  <Text style={styles.questionLabel}>Today's question</Text>
                  <Text style={styles.questionText}>{prompt.question_text}</Text>
                </View>

                {/* Unanswered state */}
                {answerState === 'unanswered' && (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Type your answer..."
                      placeholderTextColor="#8E8E93"
                      value={inputText}
                      onChangeText={setInputText}
                      multiline
                      autoCorrect
                      returnKeyType="default"
                    />
                    {submitError ? (
                      <Text style={styles.errorText}>{submitError}</Text>
                    ) : null}
                    <TouchableOpacity
                      style={[styles.button, !inputText.trim() && styles.buttonDisabled]}
                      onPress={handleSubmit}
                      disabled={submitting || !inputText.trim() || uploading}
                      activeOpacity={0.8}
                    >
                      {submitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.buttonText}>Submit</Text>
                      )}
                    </TouchableOpacity>

                    {/* OR divider */}
                    <View style={styles.orRow}>
                      <View style={styles.orLine} />
                      <Text style={styles.orText}>or</Text>
                      <View style={styles.orLine} />
                    </View>

                    {/* Hold to Record */}
                    <TouchableOpacity
                      style={[
                        styles.voiceButton,
                        isRecording && styles.voiceButtonRecording,
                        (uploading || submitting) && styles.buttonDisabled,
                      ]}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      disabled={uploading || submitting}
                      activeOpacity={0.85}
                    >
                      {uploading ? (
                        <ActivityIndicator color="#FF2A5F" />
                      ) : (
                        <Text style={styles.voiceButtonText}>
                          {isRecording ? '● Recording...' : '⏺  Hold to Record'}
                        </Text>
                      )}
                    </TouchableOpacity>
                    {voiceError ? <Text style={styles.errorText}>{voiceError}</Text> : null}
                  </>
                )}

                {/* Waiting state */}
                {answerState === 'waiting' && (
                  <>
                    <View style={styles.waitingAnswerCard}>
                      <Text style={styles.answerCardLabel}>Your answer</Text>
                      <Text style={styles.waitingAnswerText}>{myAnswer}</Text>
                    </View>
                    <View style={styles.partnerWaitingCard}>
                      <Text style={styles.answerCardLabel}>Partner</Text>
                      <Text style={styles.partnerWaitingText}>🔒 Waiting for their response...</Text>
                    </View>
                  </>
                )}

                {/* Revealed state */}
                {answerState === 'revealed' && (
                  <>
                    <View style={styles.answerCard}>
                      <Text style={styles.answerCardLabel}>You</Text>
                      <Text style={styles.answerText}>{myAnswer}</Text>
                    </View>
                    <View style={styles.answerCard}>
                      <Text style={styles.answerCardLabel}>Partner</Text>
                      {partnerAudioUrl ? (
                        <TouchableOpacity
                          style={[
                            styles.listenButton,
                            (isPlaying || isBuffering) && styles.listenButtonActive,
                          ]}
                          onPressIn={handleListenPressIn}
                          onPressOut={handleListenPressOut}
                          activeOpacity={0.85}
                        >
                          {isBuffering ? (
                            <ActivityIndicator color="#FF2A5F" />
                          ) : (
                            <Text style={styles.listenButtonText}>
                              {isPlaying ? '♥ Playing...' : '🔊  Hold to Listen'}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.answerText}>{partnerAnswer}</Text>
                      )}
                    </View>
                  </>
                )}

                {/* Past Memories gallery */}
                {memories.length > 0 && (
                  <View style={styles.memoriesSection}>
                    <Text style={styles.memoriesLabel}>Past Memories</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.memoriesScroll}
                    >
                      {(isPremium ? memories : memories.slice(0, 2)).map((m) => (
                        <View key={m.date} style={styles.memoryCard}>
                          <Text style={styles.memoryDate}>{formatDate(m.date)}</Text>
                          <Text style={styles.memoryQuestion} numberOfLines={2}>
                            {m.question}
                          </Text>
                          <Text style={styles.memoryAnswerLabel}>You</Text>
                          <Text style={styles.memoryAnswerText} numberOfLines={3}>
                            {m.myAnswer}
                          </Text>
                          <Text style={[styles.memoryAnswerLabel, { marginTop: 10 }]}>Partner</Text>
                          <Text style={styles.memoryAnswerText} numberOfLines={3}>
                            {m.partnerAnswer}
                          </Text>
                        </View>
                      ))}
                      {/* Upsell card for free users */}
                      {!isPremium && (
                        <TouchableOpacity
                          style={styles.unlockCard}
                          onPress={() => setShowPaywall(true)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.unlockIcon}>✦</Text>
                          <Text style={styles.unlockTitle}>Unlock All Memories</Text>
                          <Text style={styles.unlockSubtext}>Go Premium to see your full history</Text>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Settings modal */}
      <Modal visible={showSettings} animationType="slide" onRequestClose={() => setShowSettings(false)}>
        <SettingsScreen
          pairCode={pairCode}
          onClose={() => setShowSettings(false)}
          onGoToPremium={() => {
            setShowSettings(false);
            setShowPaywall(true);
          }}
        />
      </Modal>

      {/* Paywall modal */}
      <Modal visible={showPaywall} animationType="slide" onRequestClose={() => setShowPaywall(false)}>
        <PaywallScreen
          onClose={() => setShowPaywall(false)}
          onPremiumUnlocked={() => {
            setShowPaywall(false);
            onPremiumUnlocked();
          }}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  loadingIndicator: {
    flex: 1,
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
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  gearHit: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    color: '#8E8E93',
    fontSize: 22,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#8E8E93',
    fontSize: 14,
  },
  questionCard: {
    backgroundColor: '#1C1C21',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  questionLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  input: {
    backgroundColor: '#1C1C21',
    color: '#FFFFFF',
    borderRadius: 12,
    minHeight: 80,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF2A5F',
    fontSize: 14,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#FF2A5F',
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  waitingAnswerCard: {
    backgroundColor: '#1C1C21',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    opacity: 0.45,
  },
  partnerWaitingCard: {
    backgroundColor: '#1C1C21',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  partnerWaitingText: {
    color: '#8E8E93',
    fontSize: 16,
    lineHeight: 22,
  },
  answerCardLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  waitingAnswerText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  answerCard: {
    backgroundColor: '#1C1C21',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  answerText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  // Past Memories
  memoriesSection: {
    marginTop: 8,
  },
  memoriesLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  memoriesScroll: {
    paddingBottom: 4,
  },
  memoryCard: {
    width: 240,
    backgroundColor: '#1C1C21',
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
  },
  memoryDate: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  memoryQuestion: {
    color: '#8E8E93',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 14,
  },
  memoryAnswerLabel: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  memoryAnswerText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  unlockCard: {
    width: 200,
    backgroundColor: '#1C1C21',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF2A5F',
    padding: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockIcon: {
    color: '#FF2A5F',
    fontSize: 28,
    marginBottom: 10,
  },
  unlockTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  unlockSubtext: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2C2C35',
  },
  orText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  voiceButton: {
    backgroundColor: '#1C1C21',
    borderRadius: 12,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF2A5F',
  },
  voiceButtonRecording: {
    backgroundColor: '#2A0A12',
  },
  voiceButtonText: {
    color: '#FF2A5F',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  listenButton: {
    backgroundColor: '#1C1C21',
    borderRadius: 12,
    minHeight: 56,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: '#FF2A5F',
  },
  listenButtonActive: {
    backgroundColor: '#2A0A12',
    opacity: 0.8,
  },
  listenButtonText: {
    color: '#FF2A5F',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});
