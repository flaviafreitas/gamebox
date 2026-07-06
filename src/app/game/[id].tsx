import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Cover } from '@/components/game-card';
import { RatingStars } from '@/components/rating-stars';
import { StatusPicker } from '@/components/status-picker';
import { StoryCard, STORY_HEIGHT, STORY_WIDTH } from '@/components/story-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getShelfStatus, getMyLogsForGame, setShelfStatus } from '@/lib/games';
import { getGame } from '@/lib/igdb';
import { getProfile } from '@/lib/profile';
import { shareViewToStory } from '@/lib/share';
import type { Log, ShelfStatus } from '@/types/models';

const canShare = Platform.OS !== 'web';

export default function GameDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session!.user.id;
  const { id } = useLocalSearchParams<{ id: string }>();
  const gameId = Number(id);

  const gameQuery = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => getGame(gameId),
    enabled: Number.isFinite(gameId),
  });
  const game = gameQuery.data;

  const statusQuery = useQuery({
    queryKey: ['shelf', gameId, userId],
    queryFn: () => getShelfStatus(gameId, userId),
    enabled: Number.isFinite(gameId),
  });

  const logsQuery = useQuery({
    queryKey: ['my-logs', gameId, userId],
    queryFn: () => getMyLogsForGame(gameId, userId),
    enabled: Number.isFinite(gameId),
  });

  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId),
  });

  // Compartilhamento do registro nos stories (captura de uma view oculta).
  const shareRef = useRef<View>(null);
  const [sharingLog, setSharingLog] = useState<Log | null>(null);
  const [sharingBusy, setSharingBusy] = useState(false);

  function startShare(log: Log) {
    setSharingBusy(true);
    setSharingLog(log);
  }

  useEffect(() => {
    if (!sharingLog) return;
    let cancelled = false;
    // pequeno atraso pra garantir que a capa carregou antes de capturar
    const timer = setTimeout(async () => {
      try {
        await shareViewToStory(shareRef);
      } catch (err) {
        Alert.alert('Erro ao compartilhar', (err as Error).message);
      } finally {
        if (!cancelled) {
          setSharingBusy(false);
          setSharingLog(null);
        }
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sharingLog]);

  const statusMutation = useMutation({
    mutationFn: (status: ShelfStatus | null) => setShelfStatus(game!, userId, status),
    onSuccess: (_data, status) => {
      queryClient.setQueryData(['shelf', gameId, userId], status);
      queryClient.invalidateQueries({ queryKey: ['shelf', gameId, userId] });
    },
    onError: (err) => Alert.alert('Erro', (err as Error).message),
  });

  if (gameQuery.isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.accent} />
        </View>
      </Screen>
    );
  }

  if (gameQuery.isError || !game) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ThemedText type="small" themeColor="danger">
            Não foi possível carregar o jogo.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  const year = game.first_release_date?.slice(0, 4);

  return (
    <Screen padded={false} edges={[]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Cover url={game.cover_url} width={110} />
          <View style={styles.heroInfo}>
            <ThemedText type="title" style={styles.name}>
              {game.name}
            </ThemedText>
            {year ? (
              <ThemedText type="small" themeColor="textSecondary">
                {year}
              </ThemedText>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Sua prateleira
          </ThemedText>
          <StatusPicker
            value={statusQuery.data ?? null}
            onChange={(s) => statusMutation.mutate(s)}
            disabled={statusMutation.isPending}
          />
        </View>

        <Button
          title="Registrar / avaliar"
          onPress={() => router.push(`/log/${game.igdb_id}`)}
        />

        {logsQuery.data?.length ? (
          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Seus registros
            </ThemedText>
            {logsQuery.data.map((log) => (
              <View key={log.id} style={[styles.logCard, { backgroundColor: theme.surface }]}>
                {log.rating != null ? <RatingStars value={log.rating} size={18} /> : null}
                {log.review ? (
                  <ThemedText type="small" style={styles.review}>
                    {log.review}
                  </ThemedText>
                ) : null}
                <ThemedText type="small" themeColor="textMuted">
                  {new Date(log.created_at).toLocaleDateString('pt-BR')}
                  {log.liked ? '  ·  ❤️' : ''}
                </ThemedText>
                {canShare ? (
                  <Pressable
                    onPress={() => startShare(log)}
                    disabled={sharingBusy}
                    style={styles.shareBtn}>
                    <ThemedText type="smallBold" style={{ color: theme.accent }}>
                      {sharingBusy && sharingLog?.id === log.id
                        ? 'Gerando...'
                        : '↗  Compartilhar nos stories'}
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {game.genres?.length ? (
          <MetaRow label="Gêneros" value={game.genres.join(', ')} />
        ) : null}
        {game.platforms?.length ? (
          <MetaRow label="Plataformas" value={game.platforms.join(', ')} />
        ) : null}

        {game.summary ? (
          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Sobre
            </ThemedText>
            <ThemedText type="default" style={styles.summary}>
              {game.summary}
            </ThemedText>
          </View>
        ) : null}
      </ScrollView>

      {sharingLog ? (
        <View style={styles.hiddenCapture} pointerEvents="none">
          <View ref={shareRef} collapsable={false}>
            <StoryCard
              coverUrl={game.cover_url}
              title={game.name}
              year={year}
              rating={sharingLog.rating}
              review={sharingLog.review}
              username={profileQuery.data?.username}
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <ThemedText type="small" themeColor="textMuted" style={styles.metaLabel}>
        {label}
      </ThemedText>
      <ThemedText type="small" style={styles.metaValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.four, gap: Spacing.four },
  hero: { flexDirection: 'row', gap: Spacing.three },
  heroInfo: { flex: 1, gap: Spacing.one, justifyContent: 'flex-end' },
  name: { fontSize: 28, lineHeight: 32 },
  section: { gap: Spacing.two },
  logCard: { padding: Spacing.three, borderRadius: Radius.md, gap: Spacing.two },
  review: { lineHeight: 20 },
  shareBtn: { paddingTop: Spacing.one },
  hiddenCapture: {
    position: 'absolute',
    left: -10000,
    top: 0,
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
  },
  metaRow: { flexDirection: 'row', gap: Spacing.two },
  metaLabel: { width: 96 },
  metaValue: { flex: 1 },
  summary: { lineHeight: 22 },
});
