import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface RatingStarsProps {
  value: number; // 0 a 5, em passos de 0.5
  onChange?: (value: number) => void;
  size?: number;
}

/** Linha de 5 estrelas com suporte a meia-estrela (toque na metade esquerda/direita). */
export function RatingStars({ value, onChange, size = 34 }: RatingStarsProps) {
  const theme = useTheme();
  const editable = !!onChange;

  function iconFor(index: number): keyof typeof Ionicons.glyphMap {
    const full = index + 1;
    if (value >= full) return 'star';
    if (value >= full - 0.5) return 'star-half';
    return 'star-outline';
  }

  function setValue(next: number) {
    if (!onChange) return;
    // tocar de novo no mesmo valor zera
    onChange(value === next ? 0 : next);
  }

  return (
    <View style={styles.row}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={{ width: size, height: size }}>
          <Ionicons name={iconFor(i)} size={size} color={theme.star} />
          {editable ? (
            <View style={styles.touchOverlay}>
              <Pressable style={styles.half} onPress={() => setValue(i + 0.5)} />
              <Pressable style={styles.half} onPress={() => setValue(i + 1)} />
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  half: {
    flex: 1,
  },
});
