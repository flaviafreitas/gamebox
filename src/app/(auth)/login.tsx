import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Preencha e-mail e senha');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      Alert.alert('Não foi possível entrar', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <ThemedText style={styles.logoMark}>GL</ThemedText>
          </View>
          <ThemedText type="subtitle">Entrar</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Bem-vinda de volta ao GameLog.
          </ThemedText>
        </View>

        <View style={styles.form}>
          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="voce@exemplo.com"
          />
          <TextField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          <Button title="Entrar" onPress={handleLogin} loading={loading} />
        </View>

        <View style={styles.footer}>
          <ThemedText type="small" themeColor="textSecondary">
            Ainda não tem conta?{' '}
          </ThemedText>
          <Link href="/(auth)/signup" replace>
            <ThemedText type="smallBold" style={{ color: Colors.dark.accent }}>
              Criar conta
            </ThemedText>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'center', gap: Spacing.five },
  header: { alignItems: 'center', gap: Spacing.two },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  logoMark: { fontSize: 28, fontWeight: '800', color: Colors.dark.accentText },
  form: { gap: Spacing.three },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
