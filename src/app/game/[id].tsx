import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { Cover } from '@/components/game-card';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getGame } from '@/lib/igdb';

export default function GameDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const gameId = Number(id);

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => getGame(gameId),
    enabled: Number.isFinite(gameId),
  });

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.accent} />
        </View>
      </Screen>
    );
  }

  if (isError || !game) {
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
  metaRow: { flexDirection: 'row', gap: Spacing.two },
  metaLabel: { width: 96 },
  metaValue: { flex: 1 },
  section: { gap: Spacing.two },
  summary: { lineHeight: 22 },
});
