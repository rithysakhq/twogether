import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

type Props = { progress: number }; // 0 to 1

export default function ProgressBar({ progress }: Props) {
  const scheme = useColorScheme() ?? 'dark';
  const palette = Colors[scheme];

  return (
    <View style={[styles.track, { backgroundColor: palette.card }]}>
      <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: Colors.primary }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 32,
  },
});
