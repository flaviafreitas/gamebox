import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { RatingStars } from '@/components/rating-stars';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export const STORY_WIDTH = 360;
export const STORY_HEIGHT = 640;

interface StoryCardProps {
  coverUrl: string | null;
  title: string;
  year?: string;
  rating: number | null;
  review?: string | null;
  username?: string | null;
}

/** Card 9:16 para compartilhar nos stories (capturado por view-shot). */
export function StoryCard({ coverUrl, title, year, rating, review, username }: StoryCardProps) {
  return (
    <LinearGradient colors={['#241a44', '#0F1013']} style={styles.card}>
      <ThemedText style={styles.brand}>GameBox</ThemedText>

      <View style={styles.center}>
        <View style={styles.cover}>
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={styles.coverImg} contentFit="cover" />
          ) : null}
        </View>

        <ThemedText style={styles.title} numberOfLines={2}>
          {title}
        </ThemedText>
        {year ? <ThemedText style={styles.year}>{year}</ThemedText> : null}

        {rating != null ? (
          <View style={styles.stars}>
            <RatingStars value={rating} size={30} />
          </View>
        ) : null}

        {review ? (
          <ThemedText style={styles.review} numberOfLines={4}>
            “{review}”
          </ThemedText>
        ) : null}
      </View>

      <ThemedText style={styles.footer}>
        {username ? `@${username}` : 'no GameBox'}
      </ThemedText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.dark.accent,
    letterSpacing: 0.5,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  cover: {
    width: 190,
    height: 253,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surfaceAlt,
  },
  coverImg: { width: '100%', height: '100%' },
  title: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '700',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  year: { fontSize: 15, color: Colors.dark.textSecondary },
  stars: { marginTop: Spacing.one },
  review: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.two,
  },
  footer: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
});
