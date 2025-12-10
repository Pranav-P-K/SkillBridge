import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import { listSkillSwaps, createSkillSwap, acceptSkillSwap } from '../lib/api';
import { theme } from '../lib/theme';
import { useNavigation } from '@react-navigation/native';

type Swap = {
  id: string;
  offerSkill: string;
  wantSkill: string;
  status: string;
  userId: string;
  partnerId?: string;
};

export default function SkillSwapScreen() {
  const nav = useNavigation<any>();
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState('');
  const [want, setWant] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listSkillSwaps();
      setSwaps(data);
    } catch (e) {
      console.log('Failed to load swaps', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!offer || !want) {
      Alert.alert('Missing', 'Offer and Want skills are required.');
      return;
    }
    setSaving(true);
    try {
      await createSkillSwap({ offerSkill: offer, wantSkill: want, note });
      setOffer('');
      setWant('');
      setNote('');
      load();
    } catch (e) {
      Alert.alert('Error', 'Could not create swap');
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptSkillSwap(id);
      load();
    } catch (e) {
      Alert.alert('Error', 'Could not accept swap');
    }
  };

  const renderItem = ({ item }: { item: Swap }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.offerSkill} ↔ {item.wantSkill}</Text>
      <Text style={styles.subtitle}>Status: {item.status}</Text>
      {item.status === 'open' && (
        <TouchableOpacity style={styles.cta} onPress={() => handleAccept(item.id)}>
          <Text style={styles.ctaText}>Accept</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}><Text style={{color: theme.colors.primary}}>‹ Back</Text></TouchableOpacity>
        <Text style={styles.screenTitle}>SkillSwap</Text>
      </View>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="I can teach..." value={offer} onChangeText={setOffer} />
        <TextInput style={styles.input} placeholder="I want to learn..." value={want} onChangeText={setWant} />
        <TextInput style={styles.input} placeholder="Note (optional)" value={note} onChangeText={setNote} />
        <TouchableOpacity style={styles.cta} onPress={handleCreate} disabled={saving}>
          <Text style={styles.ctaText}>{saving ? 'Posting...' : 'Post swap'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
      ) : (
        <FlatList
          data={swaps}
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
  form: { marginTop: 16, backgroundColor: theme.colors.surface, padding: 12, borderRadius: theme.radii.md },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.radii.md,
    padding: 10,
    color: theme.colors.text,
    marginTop: 8,
  },
  cta: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '800' },
  card: {
    marginTop: 12,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.radii.md,
  },
  title: { fontWeight: '800', color: theme.colors.text },
  subtitle: { color: theme.colors.muted, marginTop: 4 },
});

