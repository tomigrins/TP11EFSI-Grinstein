import { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
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
  const { error, resetGame, isLoading, playerName, setPlayerName, canPlay } = useGameContext();
  const [draftName, setDraftName] = useState(playerName);

  useEffect(() => {
    setDraftName(playerName);
  }, [playerName]);

  const handleSaveName = () => {
    const trimmed = draftName.trim();

    if (!trimmed) {
      return;
    }

    setPlayerName(trimmed);
    Keyboard.dismiss();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {!canPlay ? (
          <ThemedView type="backgroundElement" style={styles.nameCard}>
            <ThemedText type="title" style={styles.nameTitle}>
              ¿Cómo te llamás?
            </ThemedText>

            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Tu nombre"
              placeholderTextColor="#d8e7ff"
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.nameInput}
              onSubmitEditing={handleSaveName}
              returnKeyType="done"
            />

            <Pressable onPress={handleSaveName} style={styles.primaryButton}>
              <ThemedText type="smallBold" themeColor="text">
                Empezar a jugar
              </ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
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
        )}

        {canPlay ? <Leaderboard /> : null}

        {error ? (
          <ThemedView type="backgroundElement" style={styles.errorBox}>
            <ThemedText type="smallBold">{error}</ThemedText>
          </ThemedView>
        ) : null}

        {canPlay ? (
          <Pressable onPress={resetGame} style={styles.resetButton}>
            <ThemedText type="smallBold">Reiniciar turno</ThemedText>
          </Pressable>
        ) : null}
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
  nameCard: {
    width: '100%',
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#253548',
    gap: 14,
    shadowColor: '#020b14',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  nameTitle: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
  },
  nameInput: {
    width: '100%',
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ca1ff',
    backgroundColor: '#0d1d2b',
    color: '#eaf4ff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryButton: {
    alignSelf: 'center',
    backgroundColor: '#2b6fe8',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
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
