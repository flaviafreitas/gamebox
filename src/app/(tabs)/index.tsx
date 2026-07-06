import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { LogItem } from '@/components/log-item';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getFeed } from '@/lib/social';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const userId = session!.user.id;
  const [userSearch, setUserSearch] = useState('');

  const feedQuery = useQuery({ queryKey: ['feed', userId], queryFn: () => getFeed(userId) });

  function goToUser() {
    const uname = userSearch.trim().toLowerCase().replace(/^@/, '');
    if (uname) {
      router.push(`/user/${uname}`);
      setUserSearch('');
    }
  }

  return (
    <Screen padded={false} edges={['top']}>
      <FlatList
        data={feedQuery.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
        renderItem={({ item }) => (
          <LogItem
            log={item}
            authorName={
              item.profiles ? `@${item.profiles.username}` : undefined
            }
            onPress={() => item.games && router.push(`/game/${item.games.igdb_id}`)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="subtitle">Início</ThemedText>
            <TextField
              value={userSearch}
              onChangeText={setUserSearch}
              placeholder="Encontrar pessoas por @usuário"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={goToUser}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {feedQuery.isLoading ? (
              <ActivityIndicator color={theme.accent} />
            ) : (
              <ThemedText type="small" themeColor="textMuted" style={styles.emptyText}>
                Seu feed está vazio. Encontre pessoas pelo @usuário acima e siga-as para ver a
                atividade delas aqui.
              </ThemedText>
            )}
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six },
  header: { paddingVertical: Spacing.three, gap: Spacing.three },
  empty: { paddingTop: Spacing.five, alignItems: 'center' },
  emptyText: { textAlign: 'center', maxWidth: 280 },
});
