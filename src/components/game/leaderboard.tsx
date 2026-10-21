import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/context/game-context';

export function Leaderboard() {
  const { leaderboard, playerName } = useGameContext();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold" style={styles.title}>
        Ranking
      </ThemedText>

      {leaderboard.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.emptyState}>
          Aún no hay puntajes guardados.
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {leaderboard.map((entry, index) => {
            const isCurrentPlayer = entry.name.toLowerCase() === playerName.trim().toLowerCase();

            return (
              <View
                key={entry.id || `${entry.name}-${index}`}
                style={[styles.row, isCurrentPlayer && styles.currentPlayerRow]}
              >
                <ThemedText type="smallBold" style={styles.rankText}>
                  #{index + 1}
                </ThemedText>

                <ThemedText
                  type="smallBold"
                  numberOfLines={1}
                  style={[styles.playerName, isCurrentPlayer && styles.currentPlayerText]}
                >
                  {entry.name}
                </ThemedText>

                <ThemedText type="smallBold" style={styles.scoreText}>
                  {entry.score}
                </ThemedText>
              </View>
            );
          })}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 18,
    padding: 12,
    gap: 10,
    backgroundColor: '#17283b',
    borderWidth: 1,
    borderColor: '#40648f',
  },
  title: {
    color: '#f7d35b',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  list: {
    width: '100%',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    backgroundColor: '#1d3044',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  currentPlayerRow: {
    borderWidth: 1,
    borderColor: '#73c0ff',
    backgroundColor: '#22456c',
  },
  rankText: {
    minWidth: 34,
    color: '#b9d9ff',
  },
  playerName: {
    flex: 1,
    color: '#edf6ff',
  },
  currentPlayerText: {
    color: '#ffffff',
  },
  scoreText: {
    color: '#f7d35b',
    minWidth: 46,
    textAlign: 'right',
  },
  emptyState: {
    color: '#dfeafc',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
