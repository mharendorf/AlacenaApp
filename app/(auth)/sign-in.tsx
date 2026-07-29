import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { signIn, signUp } from '../../src/features/auth/api';
import { colors, fonts } from '../../src/theme/tokens';

const formSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  nombre: z.string().optional(),
});

type FormValues = { email: string; password: string; nombre?: string };

function makeResolver(isSignUp: boolean) {
  return zodResolver(
    formSchema.superRefine((data, ctx) => {
      if (isSignUp && !data.nombre?.trim()) {
        ctx.addIssue({ code: 'custom', path: ['nombre'], message: 'Ingresá tu nombre' });
      }
    })
  );
}

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isSignUp = mode === 'signUp';

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: makeResolver(isSignUp),
    defaultValues: { email: '', password: '', nombre: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      if (isSignUp) {
        await signUp(values.email, values.password, values.nombre ?? '');
      } else {
        await signIn(values.email, values.password);
      }
      router.replace('/');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ocurrió un error, probá de nuevo.');
    }
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 48 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={styles.h1}>Alacena</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Creá tu cuenta para empezar.' : 'Iniciá sesión para ver tu lista.'}
          </Text>
        </View>

        <View style={{ gap: 14 }}>
          {isSignUp && (
            <Controller
              control={control}
              name="nombre"
              render={({ field }) => (
                <Input
                  label="Tu nombre"
                  placeholder="Mai"
                  value={field.value}
                  onChangeText={field.onChange}
                  autoCapitalize="words"
                />
              )}
            />
          )}
          {isSignUp && errors.nombre && <Text style={styles.fieldError}>{errors.nombre.message}</Text>}

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                label="Email"
                placeholder="vos@ejemplo.com"
                value={field.value}
                onChangeText={field.onChange}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            )}
          />
          {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input
                label="Contraseña"
                placeholder="••••••••"
                value={field.value}
                onChangeText={field.onChange}
                secureTextEntry
                textContentType={isSignUp ? 'newPassword' : 'password'}
              />
            )}
          />
          {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}
        </View>

        {submitError && <Text style={styles.submitError}>{submitError}</Text>}

        <View style={{ gap: 12 }}>
          <Button variant="primary" block loading={isSubmitting} onPress={onSubmit}>
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </Button>
          <Button
            variant="ghost"
            onPress={() => {
              setSubmitError(null);
              setMode(isSignUp ? 'signIn' : 'signUp');
            }}
          >
            {isSignUp ? '¿Ya tenés cuenta? Iniciá sesión' : '¿No tenés cuenta? Creá una'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 48, gap: 32, flexGrow: 1, justifyContent: 'center' },
  h1: { fontFamily: fonts.heading, fontSize: 34, color: colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontFamily: fonts.body, fontSize: 15, color: colors.text, opacity: 0.7, textAlign: 'center' },
  fieldError: { fontFamily: fonts.body, fontSize: 12, color: colors.destructive, marginTop: -8 },
  submitError: { fontFamily: fonts.body, fontSize: 13, color: colors.destructive, textAlign: 'center' },
});
