import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

type Props = {
  pairCode: string;
  onClose: () => void;
  onGoToPremium: () => void;
};

export default function SettingsScreen({ pairCode, onClose, onGoToPremium }: Props) {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    // onAuthStateChange in App.tsx handles routing — no callback needed
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity style={styles.closeHit} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Pair code card */}
        <Text style={styles.sectionLabel}>Your pair code</Text>
        <View style={styles.codeCard}>
          <Text style={styles.code}>{pairCode}</Text>
          <Text style={styles.codeHint}>Share this with your partner to link up</Text>
        </View>

        <View style={styles.divider} />

        {/* Go Premium */}
        <TouchableOpacity style={styles.actionRow} onPress={onGoToPremium} activeOpacity={0.8}>
          <Text style={styles.premiumText}>Twogether Premium  ✦</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.actionRow}
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.8}
        >
          {signingOut ? (
            <ActivityIndicator color="#FF2A5F" />
          ) : (
            <Text style={styles.signOutText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  closeHit: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: '#8E8E93',
    fontSize: 18,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  sectionLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  codeCard: {
    backgroundColor: '#1C1C21',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  code: {
    color: '#FF2A5F',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 8,
    marginBottom: 8,
  },
  codeHint: {
    color: '#8E8E93',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#1C1C21',
    marginVertical: 24,
  },
  actionRow: {
    backgroundColor: '#1C1C21',
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  premiumText: {
    color: '#FF2A5F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutText: {
    color: '#FF2A5F',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
