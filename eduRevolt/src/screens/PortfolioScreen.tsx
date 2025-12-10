import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { getPortfolio } from '../lib/api';
import { theme } from '../lib/theme';
import { useNavigation } from '@react-navigation/native';

export default function PortfolioScreen() {
  const nav = useNavigation<any>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getPortfolio();
        if (!cancelled) setData(res);
      } catch (e) {
        console.log('Failed to load portfolio', e);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}><Text style={{color: theme.colors.primary}}>‹ Back</Text></TouchableOpacity>
        <Text style={styles.screenTitle}>Portfolio</Text>
      </View>

      <Text style={styles.sectionTitle}>Stats</Text>
      <Text style={styles.stat}>XP: {data?.totalXp || 0}</Text>
      <Text style={styles.stat}>Lessons: {(data?.completedLessons || []).length}</Text>
      <Text style={styles.stat}>Credits: {data?.credits || 0}</Text>

      <Text style={styles.sectionTitle}>Simulations</Text>
      <FlatList
        data={data?.simulations || []}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.topicName || item.phase}</Text>
            <Text style={styles.subtitle}>Score: {item.score}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No simulations yet</Text>}
      />

      <Text style={styles.sectionTitle}>SkillSwaps</Text>
      <FlatList
        data={data?.skillSwaps || []}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.offerSkill} ↔ {item.wantSkill}</Text>
            <Text style={styles.subtitle}>Status: {item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No SkillSwap entries</Text>}
      />

      <Text style={styles.sectionTitle}>Problem Pods</Text>
      <FlatList
        data={data?.problemPods || []}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.description}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No pods</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  screenTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  sectionTitle: { marginTop: 16, fontWeight: '800', color: theme.colors.text, fontSize: 16 },
  stat: { color: theme.colors.text, marginTop: 4 },
  card: {
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: theme.radii.md,
  },
  title: { fontWeight: '800', color: theme.colors.text },
  subtitle: { color: theme.colors.muted, marginTop: 4 },
  empty: { color: theme.colors.muted, marginTop: 4 },
});

