import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
    } catch (err) {
      Alert.alert('Erro ao sair', (err as Error).message);
      setLoading(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Perfil</ThemedText>
      </View>
      <View style={styles.body}>
        <ThemedText type="small" themeColor="textSecondary">
          Conectada como
        </ThemedText>
        <ThemedText type="default">{session?.user.email}</ThemedText>
      </View>
      <Button title="Sair" variant="secondary" onPress={handleSignOut} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: Spacing.three },
  body: { flex: 1, gap: Spacing.one, paddingTop: Spacing.four },
});
