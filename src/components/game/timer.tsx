import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/context/game-context';

export function Timer() {
  const { timeLeft } = useGameContext();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="small">Tiempo</ThemedText>
      <ThemedText type="subtitle">{timeLeft}s</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
