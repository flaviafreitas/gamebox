import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { Cover } from '@/components/game-card';
import { RatingStars } from '@/components/rating-stars';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { createLog } from '@/lib/games';
import { getGame } from '@/lib/igdb';

export default function LogModal() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session!.user.id;
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const id = Number(gameId);

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [liked, setLiked] = useState(false);
  const [playedToday, setPlayedToday] = useState(true);

  const gameQuery = useQuery({
    queryKey: ['game', id],
    queryFn: () => getGame(id),
    enabled: Number.isFinite(id),
  });
  const game = gameQuery.data;

  const mutation = useMutation({
    mutationFn: () =>
      createLog(game!, userId, {
        rating: rating > 0 ? rating : null,
        review,
        liked,
        playedToday,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-logs', id, userId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      router.back();
    },
    onError: (err) => Alert.alert('Erro ao salvar', (err as Error).message),
  });

  if (gameQuery.isLoading || !game) {
    return (
      <Screen edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.accent} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Cover url={game.cover_url} width={56} />
            <View style={styles.headerInfo}>
              <ThemedText type="smallBold" numberOfLines={2}>
                {game.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {game.first_release_date?.slice(0, 4)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Sua nota
            </ThemedText>
            <RatingStars value={rating} onChange={setRating} />
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Review
            </ThemedText>
            <TextField
              value={review}
              onChangeText={setReview}
              placeholder="O que achou do jogo?"
              multiline
              numberOfLines={5}
              style={styles.reviewInput}
              textAlignVertical="top"
            />
          </View>

          <ToggleRow label="Curti este jogo" value={liked} onValueChange={setLiked} />
          <ToggleRow label="Joguei hoje" value={playedToday} onValueChange={setPlayedToday} />

          <Button title="Salvar registro" onPress={() => mutation.mutate()} loading={mutation.isPending} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.toggleRow}>
      <ThemedText type="default">{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.accent, false: theme.surfaceAlt }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.four, gap: Spacing.four },
  header: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  headerInfo: { flex: 1, gap: Spacing.half },
  section: { gap: Spacing.two },
  reviewInput: { height: 120, paddingTop: Spacing.two },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
