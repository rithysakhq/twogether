import React from 'react';
import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Palette } from '../../constants/Colors';

export default function UsScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const palette = Colors[scheme];
  const styles = createStyles(palette);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Us</Text>

        {/* Subscription Status */}
        <Text style={styles.sectionLabel}>Subscription</Text>
        <View style={styles.subscriptionCard}>
          <Text style={styles.subscriptionTitle}>Twogether Plus</Text>
          <Text style={styles.subscriptionSubtitle}>Shared with Partner</Text>
        </View>

        {/* Pair code */}
        <Text style={styles.sectionLabel}>Your pair code</Text>
        <View style={styles.codeCard}>
          <Text style={styles.code}>A1B2C3</Text>
          <Text style={styles.codeHint}>Share this with your partner to link up</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    scroll: {
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 48,
    },
    title: {
      color: c.text,
      fontSize: 28,
      fontWeight: 'bold',
      letterSpacing: -0.5,
      marginBottom: 32,
    },
    sectionLabel: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
    },
    subscriptionCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 32,
    },
    subscriptionTitle: {
      color: Colors.primary,
      fontSize: 20,
      fontWeight: 'bold',
      letterSpacing: -0.3,
      marginBottom: 4,
    },
    subscriptionSubtitle: {
      color: c.textMuted,
      fontSize: 14,
    },
    codeCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
    },
    code: {
      color: Colors.primary,
      fontSize: 36,
      fontWeight: 'bold',
      letterSpacing: 8,
      marginBottom: 8,
    },
    codeHint: {
      color: c.textMuted,
      fontSize: 13,
    },
  });
