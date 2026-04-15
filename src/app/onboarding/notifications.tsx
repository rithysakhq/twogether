import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
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

export default function NotificationsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const scheme = useColorScheme() ?? 'dark';
  const palette = Colors[scheme];
  const styles = createStyles(palette);
  const router = useRouter();

  async function handleFinish() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Failed to get user:', userError);
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
      if (error) {
        console.error('Failed to complete onboarding:', error);
        return;
      }
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Unexpected error in handleFinish:', err);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={palette.text} />
      </TouchableOpacity>
      <View style={styles.progressWrapper}>
        <ProgressBar progress={0.66} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.headline}>Never miss a moment.</Text>
        <Text style={styles.body}>
          Couples who enable notifications are 80% more likely to maintain their streak.
        </Text>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Allow Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: palette.card, true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleFinish}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Finish Setup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
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
      marginBottom: 16,
    },
    body: {
      color: c.textMuted,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 32,
    },
    settingsCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingsLabel: {
      color: c.text,
      fontSize: 16,
      fontWeight: '500',
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
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: 'bold',
    },
  });
