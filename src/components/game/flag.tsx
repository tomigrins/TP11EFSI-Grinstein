import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

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
    <View style={styles.wrapper}>
      <ThemedView style={styles.container}>
        <Image
          source={{ uri: currentCountry.flag }}
          style={styles.flag}
          contentFit="contain"
          transition={200}
        />
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  container: {
    width: '100%',
    maxWidth: 560,
    aspectRatio: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#cfd8e6',
    borderRadius: 18,
  },
  flag: {
    width: '100%',
    height: '100%',
    backgroundColor: '#dfe3ea',
  },
  placeholder: {
    width: '100%',
    minHeight: 220,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
