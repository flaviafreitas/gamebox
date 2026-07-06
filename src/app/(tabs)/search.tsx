import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { GameCard } from '@/components/game-card';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useDebounce } from '@/hooks/use-debounce';
import { useTheme } from '@/hooks/use-theme';
import { searchGames } from '@/lib/igdb';

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [term, setTerm] = useState('');
  const debounced = useDebounce(term.trim());

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchGames(debounced),
    enabled: debounced.length >= 2,
  });

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Buscar</ThemedText>
        <TextField
          value={term}
          onChangeText={setTerm}
          placeholder="Nome do jogo..."
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => String(item.igdb_id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <GameCard
            game={item}
            onPress={() => router.push(`/game/${item.igdb_id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            {isFetching ? (
              <ActivityIndicator color={theme.accent} />
            ) : isError ? (
              <ThemedText type="small" themeColor="danger" style={styles.msg}>
                {(error as Error).message}
              </ThemedText>
            ) : debounced.length >= 2 ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.msg}>
                Nenhum jogo encontrado.
              </ThemedText>
            ) : (
              <ThemedText type="small" themeColor="textMuted" style={styles.msg}>
                Digite ao menos 2 letras para buscar.
              </ThemedText>
            )}
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  centered: {
    paddingTop: Spacing.six,
    alignItems: 'center',
  },
  msg: {
    textAlign: 'center',
  },
});
