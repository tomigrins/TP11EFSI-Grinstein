import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/context/game-context';

export function ScoreBoard() {
  const { score } = useGameContext();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold" style={styles.label}>
        PUNTOS
      </ThemedText>

      <ThemedText type="subtitle" style={styles.scoreText}>
        {score}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
    borderRadius: 16,
    backgroundColor: '#1a2433',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#314863',
  },
  label: {
    color: '#b9d9ff',
    fontSize: 11,
    letterSpacing: 1.6,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 30,
  },
});
