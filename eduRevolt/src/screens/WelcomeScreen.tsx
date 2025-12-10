import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../lib/theme';

export default function WelcomeScreen() {
  const nav = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>SkillBridge</Text>
      <Text style={styles.headline}>Life Skills → Money Skills → Practice → Earn</Text>
      <Text style={styles.sub}>AI-personalized paths, simulations, and gigs.</Text>

      <TouchableOpacity style={styles.cta} onPress={() => nav.navigate('Auth')}>
        <Text style={styles.ctaText}>Sign Up / Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondary} onPress={() => nav.navigate('OnboardingQuiz')}>
        <Text style={styles.secondaryText}>Try the onboarding quiz</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  brand: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.text,
  },
  headline: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sub: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 14,
  },
  cta: {
    marginTop: 32,
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '800' },
  secondary: {
    marginTop: 12,
    padding: 14,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    alignItems: 'center',
  },
  secondaryText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
});

