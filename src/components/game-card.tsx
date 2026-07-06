import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { GameSearchResult } from '@/types/models';

interface GameCardProps {
  game: GameSearchResult;
  onPress?: () => void;
}

export function GameCard({ game, onPress }: GameCardProps) {
  const year = game.first_release_date?.slice(0, 4);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
      <Cover url={game.cover_url} />
      <View style={styles.info}>
        <ThemedText type="smallBold" numberOfLines={2}>
          {game.name}
        </ThemedText>
        {year ? (
          <ThemedText type="small" themeColor="textSecondary">
            {year}
          </ThemedText>
        ) : null}
        {game.platforms?.length ? (
          <ThemedText type="small" themeColor="textMuted" numberOfLines={1}>
            {game.platforms.slice(0, 3).join(' · ')}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

export function Cover({ url, width = 64 }: { url: string | null; width?: number }) {
  const theme = useTheme();
  const height = width * 1.33;
  return (
    <View style={[styles.cover, { width, height, backgroundColor: theme.surfaceAlt }]}>
      {url ? (
        <Image source={{ uri: url }} style={styles.coverImg} contentFit="cover" transition={150} />
      ) : (
        <ThemedText type="small" themeColor="textMuted">
          ?
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  cover: {
    borderRadius: Radius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
