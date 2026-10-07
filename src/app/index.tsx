import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Flag } from '@/components/game/flag';
import { GuessForm } from '@/components/game/guess-form';
import { Leaderboard } from '@/components/game/leaderboard';
import { ScoreBoard } from '@/components/game/score-board';
import { Timer } from '@/components/game/timer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/context/game-context';

export default function HomeScreen() {
  const { error, resetGame, isLoading } = useGameContext();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Adivina el país
          </ThemedText>
          <Pressable onPress={resetGame} style={styles.resetButton}>
            <ThemedText type="smallBold">Reiniciar</ThemedText>
          </Pressable>
        </ThemedView>

        {error ? (
          <ThemedView type="backgroundElement" style={styles.errorBox}>
            <ThemedText type="smallBold">{error}</ThemedText>
          </ThemedView>
        ) : null}

        <View style={styles.topRow}>
          <ScoreBoard />
          <Timer />
        </View>

        {!isLoading && <Flag />}

        <GuessForm />
        <Leaderboard />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
  },
  resetButton: {
    backgroundColor: '#dfe9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
  },
  errorBox: {
    borderRadius: 12,
    padding: 12,
  },
});
