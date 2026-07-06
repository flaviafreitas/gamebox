import { Pressable, StyleSheet, View } from 'react-native';

import { Cover } from '@/components/game-card';
import { RatingStars } from '@/components/rating-stars';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { LogWithGame } from '@/lib/profile';

interface LogItemProps {
  log: LogWithGame;
  authorName?: string;
  onPress?: () => void;
}

export function LogItem({ log, authorName, onPress }: LogItemProps) {
  const theme = useTheme();
  const game = log.games;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, opacity: pressed ? 0.8 : 1 },
      ]}>
      <Cover url={game?.cover_url ?? null} width={52} />
      <View style={styles.body}>
        {authorName ? (
          <ThemedText type="small" themeColor="textMuted">
            {authorName}
          </ThemedText>
        ) : null}
        <ThemedText type="smallBold" numberOfLines={1}>
          {game?.name ?? 'Jogo'}
        </ThemedText>
        <View style={styles.metaRow}>
          {log.rating != null ? <RatingStars value={log.rating} size={14} /> : null}
          {log.liked ? <ThemedText type="small">❤️</ThemedText> : null}
        </View>
        {log.review ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {log.review}
          </ThemedText>
        ) : null}
        <ThemedText type="small" themeColor="textMuted">
          {new Date(log.created_at).toLocaleDateString('pt-BR')}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
