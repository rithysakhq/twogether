import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Session } from '@supabase/supabase-js';
import Purchases from 'react-native-purchases';
import { supabase } from './src/lib/supabase';
import AuthScreen from './src/screens/AuthScreen';
import PairingScreen from './src/screens/PairingScreen';
import HomeScreen from './src/screens/HomeScreen';

const REVENUECAT_API_KEY = 'test_qyJSGGHxHxsiQxNOYKCFtlXiuQf';

type Profile = {
  id: string;
  pair_id: string | null;
  pair_code: string | null;
};

const generatePairCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  // Initialize RevenueCat once on mount
  useEffect(() => {
    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
  }, []);

  const checkPremium = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setIsPremium(!!info.entitlements.active['premium']);
    } catch {
      // Non-critical — default to free tier
    }
  }, []);

  const onPremiumUnlocked = useCallback(() => {
    setIsPremium(true);
  }, []);

  const fetchOrCreateProfile = useCallback(async (userId: string) => {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, pair_id, pair_code')
      .eq('id', userId)
      .single();

    if (existing) {
      setProfile(existing as Profile);
      return;
    }

    const { data: created } = await supabase
      .from('profiles')
      .insert({ id: userId, pair_code: generatePairCode() })
      .select('id, pair_id, pair_code')
      .single();

    setProfile((created as Profile) ?? null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
        setIsPremium(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    Promise.all([
      fetchOrCreateProfile(session.user.id),
      checkPremium(),
    ]).finally(() => setLoading(false));
  }, [session, fetchOrCreateProfile, checkPremium]);

  const refetchProfile = useCallback(() => {
    if (session) fetchOrCreateProfile(session.user.id);
  }, [session, fetchOrCreateProfile]);

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.center}>
          <ActivityIndicator color="#FF2A5F" />
        </SafeAreaView>
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  if (!session) {
    return (
      <SafeAreaProvider>
        <AuthScreen />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  if (!profile?.pair_id) {
    return (
      <SafeAreaProvider>
        <PairingScreen
          pairCode={profile?.pair_code ?? ''}
          onPaired={refetchProfile}
        />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <HomeScreen
        userId={session.user.id}
        pairId={profile.pair_id!}
        pairCode={profile.pair_code ?? ''}
        isPremium={isPremium}
        onPremiumUnlocked={onPremiumUnlocked}
      />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
});
