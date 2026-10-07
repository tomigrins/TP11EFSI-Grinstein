import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/context/game-context';

export function Leaderboard() {
  const { players } = useGameContext();
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold">Ranking</ThemedText>

      {sortedPlayers.map((player, index) => (
        <View key={player.id} style={styles.row}>
          <ThemedText type="small">
            {index + 1}. {player.name}
          </ThemedText>
          <ThemedText type="smallBold">{player.score} pts</ThemedText>
        </View>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
