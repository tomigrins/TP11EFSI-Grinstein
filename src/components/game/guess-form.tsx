import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/context/game-context';

export function GuessForm() {
  const { countries, guessCountry, hints } = useGameContext();
  const [guess, setGuess] = useState('');

  const suggestions = useMemo(() => {
    if (!guess.trim()) {
      return countries.slice(0, 6);
    }

    return countries
      .filter((country: { name: string }) => country.name.toLowerCase().includes(guess.trim().toLowerCase()))
      .slice(0, 6);
  }, [countries, guess]);

  const handleSubmit = () => {
    if (!guess.trim()) {
      return;
    }

    guessCountry(guess);
    setGuess('');
  };

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold">¿A qué país pertenece esta bandera?</ThemedText>

      <View style={styles.hintsBox}>
        {hints.map((hint) => (
          <ThemedText key={hint} type="small" themeColor="textSecondary">
            • {hint}
          </ThemedText>
        ))}
      </View>

      <TextInput
        value={guess}
        onChangeText={setGuess}
        placeholder="Escribe el nombre del país"
        placeholderTextColor="#7b8192"
        style={styles.input}
        autoCapitalize="words"
        autoCorrect={false}
      />

      <View style={styles.suggestions}>
        {suggestions.map((country) => (
          <Pressable
            key={country.name}
            onPress={() => {
              setGuess(country.name);
            }}
            style={styles.suggestionChip}>
            <ThemedText type="small">{country.name}</ThemedText>
          </Pressable>
        ))}
      </View>

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
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  hintsBox: {
    gap: 6,
  },
  input: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    color: '#000000',
    borderWidth: 1,
    borderColor: '#c9ced8',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#e7ebf3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3c87f7',
    minHeight: 48,
    borderRadius: 12,
  },
});
