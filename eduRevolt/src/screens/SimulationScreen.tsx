import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { generateSimulation, submitSimulation } from '../lib/api';
import { theme } from '../lib/theme';

type Simulation = {
  title: string;
  scenario: string;
  tasks: { id: string; prompt: string }[];
  rubric?: { criterion: string; weight: number }[];
};

export default function SimulationScreen() {
  const route = useRoute<any>();
  const { topicName, phase } = route.params || {};

  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await generateSimulation({ topicName, phase });
        if (!cancelled) {
          setSimulation(data.simulation);
        }
      } catch (e) {
        console.log('Failed to load simulation', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [topicName, phase]);

  const handleSubmit = async () => {
    if (!simulation) return;
    if (!response.trim()) {
      Alert.alert('Response needed', 'Please enter your answer before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const graded = await submitSimulation({
        prompt: simulation.scenario,
        response,
        phase,
        topicName,
      });
      setResult(graded);
    } catch (e) {
      Alert.alert('Error', 'Could not grade your simulation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !simulation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>{simulation.title}</Text>
      <Text style={styles.scenario}>{simulation.scenario}</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        {simulation.tasks?.map((t) => (
          <Text key={t.id} style={styles.taskItem}>• {t.prompt}</Text>
        ))}
      </View>

      {simulation.rubric && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rubric</Text>
          {simulation.rubric.map((r, idx) => (
            <Text key={idx} style={styles.taskItem}>
              • {r.criterion} ({Math.round((r.weight || 0) * 100)}%)
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Your response</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={6}
        placeholder="Write how you would act in this scenario..."
        value={response}
        onChangeText={setResponse}
      />

      <TouchableOpacity style={styles.cta} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.ctaText}>{submitting ? 'Submitting...' : 'Submit for AI review'}</Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Result</Text>
          <Text style={styles.score}>Score: {result.score}</Text>
          <Text style={styles.taskItem}>Feedback: {result.feedback}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: theme.colors.text },
  scenario: { marginTop: 10, color: theme.colors.text, lineHeight: 20 },
  card: {
    marginTop: 16,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.radii.md,
  },
  sectionTitle: { fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  taskItem: { color: theme.colors.text, marginBottom: 6 },
  input: {
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.radii.md,
    minHeight: 120,
    textAlignVertical: 'top',
    color: theme.colors.text,
  },
  cta: {
    marginTop: 16,
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '800' },
  score: { color: theme.colors.text, fontWeight: '800', marginTop: 6 },
});

