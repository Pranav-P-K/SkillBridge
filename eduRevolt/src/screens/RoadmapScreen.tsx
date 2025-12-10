import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getRoadmap, getRoadmapTasks } from '../lib/api';
import { theme } from '../lib/theme';

type Roadmap = {
  currentPhase: string;
  readinessScore: number;
  credits?: number;
  skillCredits?: number;
};

export default function RoadmapScreen() {
  const nav = useNavigation<any>();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rm, t] = await Promise.all([getRoadmap(), getRoadmapTasks()]);
        if (!cancelled) {
          setRoadmap(rm);
          setTasks(t);
        }
      } catch (e) {
        console.log('Failed to load roadmap', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Path</Text>
      <Text style={styles.phase}>Phase: {roadmap?.currentPhase || 'life_skills'}</Text>
      <Text style={styles.score}>Readiness: {roadmap?.readinessScore ?? 0}%</Text>
      <Text style={styles.score}>Credits: {roadmap?.credits ?? 0} • Skill credits: {roadmap?.skillCredits ?? 0}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily tasks</Text>
        <FlatList
          data={tasks}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.taskRow}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.reward}>+{item.rewardCredits}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: theme.colors.muted }}>No tasks</Text>}
        />
      </View>

      <TouchableOpacity style={styles.cta} onPress={() => nav.navigate('Simulation')}>
        <Text style={styles.ctaText}>Run a Simulation</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondary} onPress={() => nav.navigate('HomeScreen')}>
        <Text style={styles.secondaryText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  title: { fontSize: 24, fontWeight: '900', color: theme.colors.text },
  phase: { marginTop: 6, color: theme.colors.text, fontWeight: '700' },
  score: { color: theme.colors.muted, marginTop: 4 },
  card: {
    marginTop: 18,
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: theme.radii.md,
  },
  cardTitle: { fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  taskRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  taskTitle: { color: theme.colors.text },
  reward: { color: theme.colors.primary, fontWeight: '800' },
  cta: {
    marginTop: 24,
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
  secondaryText: { color: theme.colors.text, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

