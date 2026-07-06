import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    const cleanUser = username.trim().toLowerCase();
    if (!USERNAME_RE.test(cleanUser)) {
      Alert.alert('Usuário inválido', 'Use 3 a 20 caracteres: letras minúsculas, números ou _.');
      return;
    }
    if (!email || password.length < 6) {
      Alert.alert('Dados incompletos', 'Informe um e-mail e uma senha de ao menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await signUp({ email: email.trim(), password, username: cleanUser });
      Alert.alert('Conta criada!', 'Confirme seu e-mail se necessário e faça login.');
    } catch (err) {
      Alert.alert('Não foi possível criar a conta', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <ThemedText type="subtitle">Criar conta</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Comece a registrar seus jogos.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <TextField
              label="Nome de usuário"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="ex: flavia_gamer"
            />
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
              placeholder="mínimo 6 caracteres"
            />
            <Button title="Criar conta" onPress={handleSignup} loading={loading} />
          </View>

          <View style={styles.footer}>
            <ThemedText type="small" themeColor="textSecondary">
              Já tem conta?{' '}
            </ThemedText>
            <Link href="/(auth)/login" replace>
              <ThemedText type="smallBold" style={{ color: Colors.dark.accent }}>
                Entrar
              </ThemedText>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', gap: Spacing.five },
  header: { alignItems: 'center', gap: Spacing.two },
  form: { gap: Spacing.three },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
