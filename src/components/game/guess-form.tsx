import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/context/game-context';

export function GuessForm() {
  const { guessCountry, hints, requestHint, skipCountry } = useGameContext();
  const [guess, setGuess] = useState('');

  const handleSubmit = () => {
    if (!guess.trim()) {
      return;
    }

    guessCountry(guess);
    setGuess('');
  };

  const handleSkip = () => {
    skipCountry();
  };

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <TextInput
        value={guess}
        onChangeText={setGuess}
        placeholder="Escribe el país"
        placeholderTextColor="#d8e7ff"
        style={styles.input}
        autoCapitalize="words"
        autoCorrect={false}
        textAlign="center"
      />

      <View style={styles.hintsRow}>
        <View style={styles.hintsBox}>
          {hints.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Sin pistas aún.
            </ThemedText>
          ) : (
            hints.map((hint) => (
              <ThemedText key={hint} type="small" themeColor="textSecondary" style={styles.hintItem}>
                • {hint}
              </ThemedText>
            ))
          )}
        </View>

        <Pressable onPress={requestHint} style={styles.hintButton}>
          <ThemedText type="smallBold" themeColor="text">
            Pista
          </ThemedText>
        </Pressable>
      </View>

      <Pressable onPress={handleSkip} style={styles.skipButton}>
        <ThemedText type="smallBold" themeColor="text">
          Skip (-1)
        </ThemedText>
      </Pressable>

      <Pressable onPress={handleSubmit} style={styles.button}>
        <ThemedText type="smallBold" themeColor="text">
          Confirmar respuesta
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    padding: 10,
    gap: 8,
    backgroundColor: '#17283b',
    borderWidth: 1,
    borderColor: '#40648f',
  },
  input: {
    width: '100%',
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ca1ff',
    backgroundColor: '#0d1d2b',
    color: '#eaf4ff',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  hintsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  hintsBox: {
    flex: 1,
    minHeight: 72,
    borderRadius: 10,
    backgroundColor: '#2b5f9e',
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    gap: 4,
  },
  hintItem: {
    color: '#e9f3ff',
    fontSize: 12,
    lineHeight: 18,
  },
  hintButton: {
    minHeight: 72,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#f7d35b',
    borderWidth: 1,
    borderColor: '#f5c44b',
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    minHeight: 38,
    borderRadius: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2b6fe8',
    minHeight: 42,
    borderRadius: 12,
  },
});
