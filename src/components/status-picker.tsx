import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ShelfStatus } from '@/types/models';

const OPTIONS: { value: ShelfStatus; label: string }[] = [
  { value: 'backlog', label: 'Quero jogar' },
  { value: 'playing', label: 'Jogando' },
  { value: 'played', label: 'Zerado' },
  { value: 'dropped', label: 'Abandonei' },
];

interface StatusPickerProps {
  value: ShelfStatus | null;
  onChange: (status: ShelfStatus | null) => void;
  disabled?: boolean;
}

export function StatusPicker({ value, onChange, disabled }: StatusPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            disabled={disabled}
            onPress={() => onChange(active ? null : opt.value)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.accent : theme.surfaceAlt,
                borderColor: active ? theme.accent : theme.border,
                opacity: disabled ? 0.5 : 1,
              },
            ]}>
            <ThemedText
              type="small"
              style={{ color: active ? theme.accentText : theme.text, fontWeight: '600' }}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});
