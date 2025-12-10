import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { submitRoadmapScore } from '../lib/api';
import { theme } from '../lib/theme';

export default function OnboardingQuizScreen() {
  const nav = useNavigation<any>();
  const [careerInterest, setCareerInterest] = useState('');
  const [learningStyle, setLearningStyle] = useState('visual');
  const [confidence, setConfidence] = useState('60'); // proxy for readiness
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const numericScore = Math.min(100, Math.max(0, Number(confidence) || 60));
    setSaving(true);
    try {
      await submitRoadmapScore({ score: numericScore, phase: 'life_skills' });
      Alert.alert('Saved', 'We generated your starting roadmap.');
      nav.navigate('Roadmap');
    } catch (e) {
      Alert.alert('Error', 'Could not save your onboarding quiz.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personalize your path</Text>
      <Text style={styles.label}>Career interest</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Design, Coding, Sales"
        value={careerInterest}
        onChangeText={setCareerInterest}
      />

      <Text style={styles.label}>Learning style</Text>
      <View style={styles.row}>
        {['visual', 'auditory', 'hands-on'].map((style) => (
          <TouchableOpacity
            key={style}
            style={[styles.chip, learningStyle === style && styles.chipActive]}
            onPress={() => setLearningStyle(style)}
          >
            <Text style={learningStyle === style ? styles.chipActiveText : styles.chipText}>
              {style}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Confidence / readiness (0-100)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={confidence}
        onChangeText={setConfidence}
      />

      <TouchableOpacity style={styles.cta} onPress={handleSubmit} disabled={saving}>
        <Text style={styles.ctaText}>{saving ? 'Saving...' : 'Save & View Roadmap'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 16,
  },
  label: {
    marginTop: 12,
    color: theme.colors.muted,
    fontWeight: '600',
  },
  input: {
    marginTop: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.radii.md,
    color: theme.colors.text,
  },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: { color: theme.colors.text, fontWeight: '700' },
  chipActiveText: { color: '#fff', fontWeight: '800' },
  cta: {
    marginTop: 24,
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '800' },
});

