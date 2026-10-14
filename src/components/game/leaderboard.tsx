import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usarJuego } from '@/context/game-context';

export function Leaderboard() {
  const { top } = usarJuego();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold" style={styles.title}>
        Leaderboard
      </ThemedText>

      {top.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.emptyState}>
          Todavía no hay puntajes.
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {top.map((entry, index) => (
            <View key={`${entry.name}-${entry.playedAt}-${index}`} style={styles.row}>
              <ThemedText type="smallBold" style={styles.rank}>
                #{index + 1}
              </ThemedText>
              <ThemedText type="smallBold" style={styles.name}>
                {entry.name}
              </ThemedText>
              <ThemedText type="smallBold" style={styles.score}>
                {entry.score}
              </ThemedText>
            </View>
          ))}
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
    backgroundColor: '#253548',
    gap: 8,
  },
  title: {
    color: '#f7d35b',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a2433',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  rank: {
    color: '#b9d9ff',
    minWidth: 34,
  },
  name: {
    flex: 1,
    color: '#ffffff',
  },
  score: {
    color: '#f7d35b',
    minWidth: 42,
    textAlign: 'right',
  },
  emptyState: {
    textAlign: 'center',
    paddingVertical: 8,
  },
});

