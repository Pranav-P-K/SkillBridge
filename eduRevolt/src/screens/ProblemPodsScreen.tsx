import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import { listProblemPods, createProblemPod, respondProblemPod } from '../lib/api';
import { theme } from '../lib/theme';
import { useNavigation } from '@react-navigation/native';

type Pod = {
  id: string;
  title: string;
  description: string;
  category?: string;
  replies?: number;
};

export default function ProblemPodsScreen() {
  const nav = useNavigation<any>();
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activePod, setActivePod] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listProblemPods();
      setPods(data);
    } catch (e) {
      console.log('Failed to load pods', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!title || !desc) {
      Alert.alert('Missing', 'Title and description are required.');
      return;
    }
    setSaving(true);
    try {
      await createProblemPod({ title, description: desc });
      setTitle('');
      setDesc('');
      load();
    } catch (e) {
      Alert.alert('Error', 'Could not create pod');
    } finally {
      setSaving(false);
    }
  };

  const handleRespond = async (id: string) => {
    if (!replyText.trim()) {
      Alert.alert('Missing', 'Enter a response');
      return;
    }
    setSaving(true);
    try {
      await respondProblemPod(id, replyText);
      setReplyText('');
      setActivePod(null);
      load();
    } catch (e) {
      Alert.alert('Error', 'Could not respond');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: Pod }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.description}</Text>
      <Text style={styles.meta}>Replies: {item.replies || 0}</Text>
      {activePod === item.id ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Your help..."
            value={replyText}
            onChangeText={setReplyText}
          />
          <TouchableOpacity style={styles.cta} onPress={() => handleRespond(item.id)} disabled={saving}>
            <Text style={styles.ctaText}>{saving ? 'Sending...' : 'Send reply'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActivePod(null)} style={{ marginTop: 6 }}>
            <Text style={{ color: theme.colors.muted }}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity onPress={() => setActivePod(item.id)} style={{ marginTop: 8 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Respond</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}><Text style={{color: theme.colors.primary}}>‹ Back</Text></TouchableOpacity>
        <Text style={styles.screenTitle}>Problem Pods</Text>
      </View>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Need help with..." value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder="Describe your problem" value={desc} onChangeText={setDesc} multiline />
        <TouchableOpacity style={styles.cta} onPress={handleCreate} disabled={saving}>
          <Text style={styles.ctaText}>{saving ? 'Posting...' : 'Post request'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
      ) : (
        <FlatList
          data={pods}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 140 }}
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
  meta: { color: theme.colors.muted, marginTop: 4, fontSize: 12 },
});

