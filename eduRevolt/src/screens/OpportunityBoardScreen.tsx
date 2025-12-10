import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { listOpportunities, applyOpportunity } from '../lib/api';
import { theme } from '../lib/theme';
import { useNavigation } from '@react-navigation/native';

type Gig = {
  id: string;
  title: string;
  payout?: string;
  type?: string;
  minScore?: number;
  locked?: boolean;
  lockedReason?: string;
};

export default function OpportunityBoardScreen() {
  const nav = useNavigation<any>();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listOpportunities();
      setGigs(data);
    } catch (e) {
      console.log('Failed to load opportunities', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApply = async (id: string, locked?: boolean) => {
    if (locked) {
      Alert.alert('Locked', 'Increase readiness to unlock this gig.');
      return;
    }
    setApplying(id);
    try {
      await applyOpportunity(id);
      Alert.alert('Applied', 'Your application was submitted.');
    } catch (e) {
      Alert.alert('Error', 'Could not apply.');
    } finally {
      setApplying(null);
    }
  };

  const renderItem = ({ item }: { item: Gig }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>{item.type || 'gig'} • {item.payout || '—'}</Text>
      {item.locked && item.lockedReason ? (
        <Text style={styles.locked}>{item.lockedReason}</Text>
      ) : null}
      <TouchableOpacity
        style={[styles.cta, item.locked && styles.ctaLocked]}
        onPress={() => handleApply(item.id, item.locked)}
        disabled={item.locked || applying === item.id}
      >
        <Text style={styles.ctaText}>{applying === item.id ? 'Applying...' : 'Apply'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}><Text style={{color: theme.colors.primary}}>‹ Back</Text></TouchableOpacity>
        <Text style={styles.screenTitle}>Opportunity Board</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
      ) : (
        <FlatList
          data={gigs}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  screenTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  card: {
    marginTop: 12,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.radii.md,
  },
  title: { fontWeight: '800', color: theme.colors.text },
  meta: { color: theme.colors.muted, marginTop: 4 },
  locked: { color: theme.colors.error, marginTop: 4 },
  cta: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  ctaLocked: { backgroundColor: theme.colors.outline },
  ctaText: { color: '#fff', fontWeight: '800' },
});

