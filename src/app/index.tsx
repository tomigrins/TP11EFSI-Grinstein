import { useState } from 'react';
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
  const { error, resetGame, isLoading, playerName, setPlayerName } = useGameContext();
  const [localName, setLocalName] = useState(playerName);
  const isPlaying = Boolean(playerName);

  const handleNameSubmit = () => {
    const sanitizedName = localName.trim();
    if (!sanitizedName) {
      setPlayerName('');
      return;
    }

    setPlayerName(sanitizedName);
  };

  const handleReset = () => {
    resetGame();
    setLocalName('');
    setPlayerName('');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {!isPlaying ? (
          <>
            <ThemedView type="backgroundElement" style={styles.playerBox}>
              <ThemedText type="smallBold" style={styles.label}>
                Jugador
              </ThemedText>

              <TextInput
                value={localName}
                onChangeText={(value) => {
                  setLocalName(value);
                  if (!value.trim()) {
                    setPlayerName('');
                  }
                }}
                onSubmitEditing={handleNameSubmit}
                placeholder="Ingresá tu nombre"
                placeholderTextColor="#d8e7ff"
                autoCapitalize="words"
                autoCorrect={false}
                style={styles.nameInput}
              />

              <Pressable onPress={handleNameSubmit} style={styles.nameButton}>
                <ThemedText type="smallBold">Ingresar y jugar</ThemedText>
              </Pressable>
            </ThemedView>

            <Leaderboard />
          </>
        ) : (
          <Pressable style={styles.touchArea} onPress={Keyboard.dismiss}>
            <ThemedView type="backgroundElement" style={styles.playerBox}>
              <ThemedText type="smallBold" style={styles.label}>
                Jugador
              </ThemedText>

              <ThemedText type="small" themeColor="textSecondary" style={styles.playerNameText}>
                Jugando como: {playerName}
              </ThemedText>
            </ThemedView>

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

        {error ? (
          <ThemedView type="backgroundElement" style={styles.errorBox}>
            <ThemedText type="smallBold">{error}</ThemedText>
          </ThemedView>
        ) : null}

        {isPlaying ? (
          <Pressable onPress={handleReset} style={styles.resetButton}>
            <ThemedText type="smallBold">Reiniciar</ThemedText>
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
    gap: 10,
  },
  playerBox: {
    width: '100%',
    borderRadius: 18,
    padding: 12,
    backgroundColor: '#253548',
    borderWidth: 1,
    borderColor: '#4b6d93',
    gap: 8,
  },
  label: {
    color: '#b9d9ff',
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  nameInput: {
    width: '100%',
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4ca1ff',
    backgroundColor: '#0d1d2b',
    color: '#eaf4ff',
    fontSize: 16,
    paddingHorizontal: 12,
  },
  nameButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f7d35b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  playerNameText: {
    color: '#dfeafc',
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