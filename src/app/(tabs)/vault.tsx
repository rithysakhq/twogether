import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function VaultScreen() {
  // 1. Get the system scheme (light or dark)
  const scheme = useColorScheme() ?? 'dark';
  
  // 2. Name this 'palette' so the code below can find it!
  const palette = Colors[scheme]; 
  
  const styles = createStyles(palette);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={styles.container}>
        <Text style={styles.text}>The Vault (Coming Soon)</Text>
      </View>
    </View>
  );
}

// 3. The "Factory" that applies those colors to the UI
const createStyles = (palette: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background, // This will swap between white and deep charcoal automatically
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: palette.text, // This will swap between black and white automatically
    fontSize: 18,
    fontWeight: '600',
  },
});