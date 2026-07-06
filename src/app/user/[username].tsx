import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { LogItem } from '@/components/log-item';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getProfileByUsername, getUserLogs, getUserShelf, type LogWithGame } from '@/lib/profile';
import { follow, getFollowCounts, isFollowing, unfollow } from '@/lib/social';
import type { ShelfStatus } from '@/types/models';

const SHELF_LABELS: Record<ShelfStatus, string> = {
  backlog: 'Quero jogar',
  playing: 'Jogando',
  played: 'Zerados',
  dropped: 'Abandonados',
};

export default function UserProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const myId = session!.user.id;
  const { username } = useLocalSearchParams<{ username: string }>();

  const profileQuery = useQuery({
    queryKey: ['profile-by-username', username],
    queryFn: () => getProfileByUsername(username),
  });
  const profile = profileQuery.data;
  const targetId = profile?.id;
  const isSelf = targetId === myId;

  const logsQuery = useQuery({
    queryKey: ['user-logs', targetId],
    queryFn: () => getUserLogs(targetId!),
    enabled: !!targetId,
  });
  const shelfQuery = useQuery({
    queryKey: ['shelf-all', targetId],
    queryFn: () => getUserShelf(targetId!),
    enabled: !!targetId,
  });
  const countsQuery = useQuery({
    queryKey: ['follow-counts', targetId],
    queryFn: () => getFollowCounts(targetId!),
    enabled: !!targetId,
  });
  const followingQuery = useQuery({
    queryKey: ['is-following', myId, targetId],
    queryFn: () => isFollowing(myId, targetId!),
    enabled: !!targetId && !isSelf,
  });

  const followMutation = useMutation({
    mutationFn: (next: boolean) =>
      next ? follow(myId, targetId!) : unfollow(myId, targetId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', myId, targetId] });
      queryClient.invalidateQueries({ queryKey: ['follow-counts', targetId] });
      queryClient.invalidateQueries({ queryKey: ['feed', myId] });
    },
  });

  if (profileQuery.isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.accent} />
        </View>
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ThemedText type="small" themeColor="textMuted">
            Usuário @{username} não encontrado.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  const shelfCounts = (shelfQuery.data ?? []).reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<ShelfStatus, number>,
  );
  const isFollow = followingQuery.data ?? false;

  return (
    <Screen padded={false} edges={[]}>
      <FlatListHeaderList
        logs={logsQuery.data ?? []}
        loading={logsQuery.isLoading}
        onOpenGame={(igdbId) => router.push(`/game/${igdbId}`)}
        header={
          <View style={styles.header}>
            <View style={styles.identity}>
              <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
                <ThemedText style={styles.avatarText}>
                  {(profile.display_name ?? profile.username).charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.identityText}>
                <ThemedText type="subtitle" numberOfLines={1}>
                  {profile.display_name ?? profile.username}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  @{profile.username}
                </ThemedText>
                <ThemedText type="small" themeColor="textMuted">
                  {countsQuery.data?.followers ?? 0} seguidores ·{' '}
                  {countsQuery.data?.following ?? 0} seguindo
                </ThemedText>
              </View>
            </View>

            {!isSelf ? (
              <Button
                title={isFollow ? 'Seguindo' : 'Seguir'}
                variant={isFollow ? 'secondary' : 'primary'}
                onPress={() => followMutation.mutate(!isFollow)}
                loading={followMutation.isPending}
              />
            ) : null}

            <View style={styles.shelfRow}>
              {(Object.keys(SHELF_LABELS) as ShelfStatus[]).map((s) => (
                <View key={s} style={[styles.shelfCard, { backgroundColor: theme.surface }]}>
                  <ThemedText type="subtitle" style={styles.count}>
                    {shelfCounts[s] ?? 0}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.shelfLabel}>
                    {SHELF_LABELS[s]}
                  </ThemedText>
                </View>
              ))}
            </View>

            <ThemedText type="smallBold" themeColor="textSecondary">
              Diário
            </ThemedText>
          </View>
        }
      />
    </Screen>
  );
}

// Lista de logs com cabeçalho (extraída para manter o corpo legível).
function FlatListHeaderList({
  logs,
  loading,
  header,
  onOpenGame,
}: {
  logs: LogWithGame[];
  loading: boolean;
  header: ReactNode;
  onOpenGame: (igdbId: number) => void;
}) {
  const theme = useTheme();
  return (
    <FlatList
      data={logs}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
      ListHeaderComponent={<>{header}</>}
      renderItem={({ item }) => (
        <LogItem log={item} onPress={() => item.games && onOpenGame(item.games.igdb_id)} />
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          {loading ? (
            <ActivityIndicator color={theme.accent} />
          ) : (
            <ThemedText type="small" themeColor="textMuted">
              Nenhum registro ainda.
            </ThemedText>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, paddingBottom: Spacing.six },
  header: { gap: Spacing.four, paddingBottom: Spacing.two },
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: { width: 64, height: 64, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  identityText: { flex: 1, gap: 2 },
  shelfRow: { flexDirection: 'row', gap: Spacing.two },
  shelfCard: { flex: 1, borderRadius: Radius.md, paddingVertical: Spacing.three, alignItems: 'center', gap: 2 },
  count: { fontSize: 24, lineHeight: 28 },
  shelfLabel: { textAlign: 'center', fontSize: 11 },
  empty: { paddingTop: Spacing.five, alignItems: 'center' },
});
