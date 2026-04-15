import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Palette } from '../../constants/Colors';

export default function FoundersNoteScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const palette = Colors[scheme];
  const styles = createStyles(palette);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.headline}>Hi, I'm [Your Name] 👋</Text>
        <Text style={styles.body}>
          Long distance is brutal. I built Twogether so we could stay connected without the
          constant pressure of texting. This is a private space just for you two.
        </Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/onboarding/name')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Let's begin</Text>
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
    content: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: 'center',
    },
    headline: {
      color: c.text,
      fontSize: 32,
      fontWeight: 'bold',
      letterSpacing: -0.5,
      marginBottom: 20,
    },
    body: {
      color: c.textMuted,
      fontSize: 17,
      lineHeight: 26,
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 16,
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
