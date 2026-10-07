import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/context/game-context';

export function ScoreBoard() {
  const { score, players } = useGameContext();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={styles.scoreGroup}>
        <ThemedText type="small">Puntaje</ThemedText>
        <ThemedText type="subtitle">{score}</ThemedText>
      </View>

      <View style={styles.playerGroup}>
        {players.map((player) => (
          <View key={player.id} style={styles.playerRow}>
            <ThemedText type="small">{player.name}</ThemedText>
            <ThemedText type="smallBold">{player.score}</ThemedText>
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  scoreGroup: {
    alignItems: 'center',
    gap: 4,
  },
  playerGroup: {
    gap: 8,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
