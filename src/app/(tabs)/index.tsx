import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="subtitle">Início</ThemedText>
      </View>
      <View style={styles.empty}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
          Seu feed de atividades aparecerá aqui quando você seguir outras pessoas.
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: Spacing.three },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { textAlign: 'center', maxWidth: 280 },
});
