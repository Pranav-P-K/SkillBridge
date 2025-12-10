import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../lib/theme';

export default function SplashScreen() {
  const nav = useNavigation<any>();

  useEffect(() => {
    const t = setTimeout(() => {
      nav.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    }, 1200);
    return () => clearTimeout(t);
  }, [nav]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SkillBridge</Text>
      <Text style={styles.tagline}>Learn. Practice. Earn. Mentor.</Text>
      <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  tagline: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
    opacity: 0.9,
  },
});

