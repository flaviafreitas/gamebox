import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';

import { LogItem } from '@/components/log-item';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getProfile, getUserLogs, getUserShelf } from '@/lib/profile';
import type { ShelfStatus } from '@/types/models';

const SHELF_LABELS: Record<ShelfStatus, string> = {
  backlog: 'Quero jogar',
  playing: 'Jogando',
  played: 'Zerados',
  dropped: 'Abandonados',
};

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session, signOut } = useAuth();
  const userId = session!.user.id;
  const [signingOut, setSigningOut] = useState(false);

  const profileQuery = useQuery({ queryKey: ['profile', userId], queryFn: () => getProfile(userId) });
  const shelfQuery = useQuery({ queryKey: ['shelf-all', userId], queryFn: () => getUserShelf(userId) });
  const logsQuery = useQuery({ queryKey: ['user-logs', userId], queryFn: () => getUserLogs(userId) });

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      Alert.alert('Erro ao sair', (err as Error).message);
      setSigningOut(false);
    }
  }

  const counts = (shelfQuery.data ?? []).reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<ShelfStatus, number>,
  );

  return (
    <Screen padded={false} edges={['top']}>
      <FlatList
        data={logsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
        renderItem={({ item }) => (
          <LogItem
            log={item}
            onPress={() => item.games && router.push(`/game/${item.games.igdb_id}`)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.identity}>
              <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
                <ThemedText style={styles.avatarText}>
                  {(profileQuery.data?.display_name ?? profileQuery.data?.username ?? '?')
                    .charAt(0)
                    .toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.identityText}>
                <ThemedText type="subtitle" numberOfLines={1}>
                  {profileQuery.data?.display_name ?? profileQuery.data?.username ?? '...'}
                </ThemedText>
                {profileQuery.data?.username ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    @{profileQuery.data.username}
                  </ThemedText>
                ) : null}
              </View>
            </View>

            <View style={styles.shelfRow}>
              {(Object.keys(SHELF_LABELS) as ShelfStatus[]).map((s) => (
                <View key={s} style={[styles.shelfCard, { backgroundColor: theme.surface }]}>
                  <ThemedText type="subtitle" style={styles.count}>
                    {counts[s] ?? 0}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.shelfLabel}>
                    {SHELF_LABELS[s]}
                  </ThemedText>
                </View>
              ))}
            </View>

            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.diaryTitle}>
              Diário
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {logsQuery.isLoading ? (
              <ActivityIndicator color={theme.accent} />
            ) : (
              <ThemedText type="small" themeColor="textMuted" style={styles.emptyText}>
                Você ainda não registrou nenhum jogo. Use a aba Buscar para começar.
              </ThemedText>
            )}
          </View>
        }
        ListFooterComponent={
          <Button
            title="Sair"
            variant="secondary"
            onPress={handleSignOut}
            loading={signingOut}
          />
        }
        ListFooterComponentStyle={styles.footer}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six },
  header: { paddingVertical: Spacing.three, gap: Spacing.four },
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: { width: 64, height: 64, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  identityText: { flex: 1, gap: 2 },
  shelfRow: { flexDirection: 'row', gap: Spacing.two },
  shelfCard: { flex: 1, borderRadius: Radius.md, paddingVertical: Spacing.three, alignItems: 'center', gap: 2 },
  count: { fontSize: 24, lineHeight: 28 },
  shelfLabel: { textAlign: 'center', fontSize: 11 },
  diaryTitle: {},
  empty: { paddingTop: Spacing.five, alignItems: 'center' },
  emptyText: { textAlign: 'center', maxWidth: 260 },
  footer: { marginTop: Spacing.five },
});
