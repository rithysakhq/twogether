import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

type Props = {
  pairCode: string;
  onPaired: () => void;
};

export default function PairingScreen({ pairCode, onPaired }: Props) {
  const [partnerCode, setPartnerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLink = async () => {
    if (partnerCode.length !== 6) {
      setError('Enter the full 6-character code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.rpc('link_pair', {
        partner_code: partnerCode.toUpperCase(),
      });
      if (error) throw error;
      onPaired();
    } catch (err: any) {
      setError(err.message ?? 'Code not found. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const isReady = partnerCode.length === 6;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Link with your partner</Text>

        {/* Your code card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Your code</Text>
          <Text style={styles.code}>{pairCode}</Text>
          <Text style={styles.cardHint}>Share this with your partner</Text>
        </View>

        <View style={styles.divider} />

        {/* Enter partner's code */}
        <Text style={styles.sectionLabel}>Enter your partner's code</Text>
        <TextInput
          style={styles.input}
          placeholder="XXXXXX"
          placeholderTextColor="#8E8E93"
          value={partnerCode}
          onChangeText={(t) => setPartnerCode(t.toUpperCase())}
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, !isReady && styles.buttonDisabled]}
          onPress={handleLink}
          disabled={loading || !isReady}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Link Up</Text>
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
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#1C1C21',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  cardLabel: {
    color: '#8E8E93',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  code: {
    color: '#FF2A5F',
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 8,
    marginBottom: 12,
  },
  cardHint: {
    color: '#8E8E93',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#1C1C21',
    marginVertical: 32,
  },
  sectionLabel: {
    color: '#8E8E93',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1C1C21',
    color: '#FFFFFF',
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginBottom: 12,
  },
  error: {
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
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
