import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoBadge}>
          <ThemedText style={styles.logoMark}>GL</ThemedText>
        </View>
        <ThemedText type="subtitle" style={styles.title}>
          GameLog
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.tagline}>
          Registre, avalie e compartilhe os jogos que você jogou.
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: Radius.lg,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.dark.accentText,
  },
  title: {
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    maxWidth: 300,
  },
});
