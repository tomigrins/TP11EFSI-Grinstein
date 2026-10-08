import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Flag } from '@/components/game/flag';
import { GuessForm } from '@/components/game/guess-form';
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
        <Pressable style={styles.touchArea} onPress={Keyboard.dismiss}>
          <ThemedView type="backgroundElement" style={styles.gamePanel}>
            <View style={styles.topRow}>
              <ScoreBoard />
              <Timer />
            </View>

            {!isLoading && <Flag />}

            <GuessForm />
          </ThemedView>
        </Pressable>

        {error ? (
          <ThemedView type="backgroundElement" style={styles.errorBox}>
            <ThemedText type="smallBold">{error}</ThemedText>
          </ThemedView>
        ) : null}

        <Pressable onPress={resetGame} style={styles.resetButton}>
          <ThemedText type="smallBold">Reiniciar</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1b2a',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    justifyContent: 'center',
    gap: 10,
  },
  touchArea: {
    width: '100%',
  },
  gamePanel: {
    width: '100%',
    borderRadius: 22,
    padding: 12,
    backgroundColor: '#253548',
    gap: 12,
    shadowColor: '#020b14',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 12,
  },
  resetButton: {
    alignSelf: 'center',
    backgroundColor: '#f7d35b',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#efc94a',
  },
  errorBox: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ffd9d9',
  },
});
