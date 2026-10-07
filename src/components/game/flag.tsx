import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/context/game-context';

export function Flag() {
  const { currentCountry, isLoading } = useGameContext();

  if (isLoading || !currentCountry) {
    return (
      <ThemedView style={styles.placeholder}>
        <ActivityIndicator size="large" />
        <ThemedText type="small">Cargando banderas...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Image
        source={{ uri: currentCountry.flag }}
        style={styles.flag}
        contentFit="contain"
        transition={200}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 12,
  },
  flag: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: '#dfe3ea',
  },
  placeholder: {
    width: '100%',
    minHeight: 220,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
