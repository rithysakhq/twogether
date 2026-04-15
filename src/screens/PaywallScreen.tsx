import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

type Props = {
  onClose: () => void;
  onPremiumUnlocked: () => void;
};

const FEATURES = [
  { icon: '∞', label: 'Unlimited History', detail: 'See every answer you two have ever shared.' },
  { icon: '❄', label: 'Streak Freezes', detail: 'Protect your streak if you miss a day.' },
  { icon: '✦', label: 'Exclusive Prompts', detail: 'Deeper questions only for Premium couples.' },
];

export default function PaywallScreen({ onClose, onPremiumUnlocked }: Props) {
  const insets = useSafeAreaInsets();
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Purchases.getOfferings()
      .then(({ current }) => {
        if (current?.monthly) setPkg(current.monthly);
      })
      .catch(() => {
        // Offerings unavailable (e.g. simulator) — CTA still renders
      });
  }, []);

  const handlePurchase = async () => {
    if (!pkg) return;
    setError('');
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active['premium']) {
        onPremiumUnlocked();
        onClose();
      }
    } catch (err: any) {
      if (!err.userCancelled) {
        setError(err.message ?? 'Purchase failed. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Close button */}
      <TouchableOpacity style={[styles.closeHit, { top: Math.max(insets.top, 16) }]} onPress={onClose} activeOpacity={0.7}>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Badge */}
        <Text style={styles.badge}>Twogether Premium</Text>

        {/* Headline */}
        <Text style={styles.headline}>Protect Your{'\n'}Connection.</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Every answer is a memory. Don't let them disappear.
        </Text>

        {/* Feature rows */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDetail}>{f.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaButton, (!pkg || purchasing) && styles.ctaDisabled]}
          onPress={handlePurchase}
          disabled={!pkg || purchasing}
          activeOpacity={0.85}
        >
          {purchasing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.ctaText}>Twogether Premium — $4.99/mo</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.cancelNote}>Cancel anytime.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  closeHit: {
    position: 'absolute',
    right: 24,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeIcon: {
    color: '#8E8E93',
    fontSize: 18,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 48,
  },
  badge: {
    color: '#FF2A5F',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 16,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 40,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: '#1C1C21',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDetail: {
    color: '#8E8E93',
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: '#FF2A5F',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#FF2A5F',
    borderRadius: 14,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  cancelNote: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
  },
});
