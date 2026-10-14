import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Country = {
  name: string;
  flag: string;
};

export type LeaderboardEntry = {
  name: string;
  score: number;
  playedAt: string;
};

type GameContextType = {
  paises: Country[];
  paisActual: Country | null;
  puntos: number;
  tiempo: number;
  pistas: string[];
  isLoading: boolean;
  error: string | null;
  nombreJugador: string;
  top: LeaderboardEntry[];
  puedeJugar: boolean;
  ponerNombre: (name: string) => void;
  borrarNombre: () => void;
  adivinarPais: (guess: string) => void;
  saltarPais: () => void;
  reiniciarJuego: () => void;
  pedirPista: () => void;
};

const STORAGE_KEY = 'guess-the-flag-leaderboard';
const PLAYER_NAME_KEY = 'guess-the-flag-player-name';
const MAX_LEADERBOARD_ITEMS = 3;

const GameContext = createContext<GameContextType | undefined>(undefined);

const normalizarTexto = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const normalizarNombre = (value: string) => value.replace(/\s+/g, ' ').trim();

const ordenarTop = (entries: LeaderboardEntry[]) =>
  [...entries].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.name.localeCompare(right.name, 'es', { sensitivity: 'base' });
  });

const normalizeCountry = (entry: any): Country | null => {
  const name = typeof entry?.name === 'string' ? entry.name.trim() : undefined;
  const flagUrl = typeof entry?.flag === 'string' ? entry.flag.trim() : undefined;

  if (!name || !flagUrl) {
    return null;
  }

  const normalizedName = name.replace(/\s+/g, ' ').trim();
  const normalizedFlag = flagUrl.trim();

  if (!normalizedName || !normalizedFlag || normalizedFlag.length < 10) {
    return null;
  }

  return {
    name: normalizedName,
    flag: normalizedFlag,
  };
};

const getRandomCountry = (countries: Country[], exclude?: Country | null) => {
  if (countries.length === 0) {
    return null;
  }

  const filtered = exclude
    ? countries.filter((country) => country.name !== exclude.name)
    : countries;

  const source = filtered.length > 0 ? filtered : countries;
  return source[Math.floor(Math.random() * source.length)] ?? null;
};

const pistasFor = (countryName: string) => {
  const cleanedName = countryName.trim();
  const firstLetter = cleanedName.charAt(0)?.toUpperCase() ?? '?';
  const lastLetter = cleanedName.slice(-1).toUpperCase() || '?';
  const lettersCount = cleanedName.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '').length;

  return [
    `Empieza con la letra "${firstLetter}".`,
    `Tiene ${lettersCount} letras en su nombre.`,
    `Termina con la letra "${lastLetter}".`,
  ];
};

const leerTop = async (): Promise<LeaderboardEntry[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const validEntries = parsed.filter(
      (entry): entry is LeaderboardEntry =>
        typeof entry?.name === 'string' &&
        typeof entry?.score === 'number' &&
        typeof entry?.playedAt === 'string'
    );

    return ordenarTop(validEntries).slice(0, MAX_LEADERBOARD_ITEMS);
  } catch {
    return [];
  }
};

export function ProveedorJuego({ children }: { children: ReactNode }) {
  const [paises, setPaises] = useState<Country[]>([]);
  const [paisActual, setPaisActual] = useState<Country | null>(null);
  const [puntos, setPuntos] = useState(0);
  const [tiempo, setTiempo] = useState(20);
  const [pistas, setPistas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nombreJugador, setNombreJugadorState] = useState('');
  const [top, setTop] = useState<LeaderboardEntry[]>([]);

  const puedeJugar = nombreJugador.trim().length > 0;

  const ponerNombre = useCallback((name: string) => {
    const nextName = normalizarNombre(name);
    setNombreJugadorState(nextName);

    if (nextName) {
      AsyncStorage.setItem(PLAYER_NAME_KEY, nextName).catch(() => undefined);
    }
  }, []);

  const borrarNombre = useCallback(() => {
    setNombreJugadorState('');
    AsyncStorage.removeItem(PLAYER_NAME_KEY).catch(() => undefined);
  }, []);

  const guardarTop = useCallback((entries: LeaderboardEntry[]) => {
    const nextEntries = ordenarTop(entries).slice(0, MAX_LEADERBOARD_ITEMS);
    setTop(nextEntries);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries)).catch(() => undefined);
  }, []);

  const cambiarPuntos = useCallback((delta: number) => {
    setPuntos((prev) => prev + delta);
  }, []);

  const siguientePais = useCallback(() => {
    const chosenCountry = getRandomCountry(paises, paisActual);

    if (!chosenCountry) {
      setPaisActual(null);
      setPistas([]);
      setTiempo(0);
      return;
    }

    setPaisActual(chosenCountry);
    setPistas([]);
    setTiempo(20);
  }, [paises, paisActual]);

  const reiniciarJuego = useCallback(() => {
    const trimmedName = normalizarNombre(nombreJugador);
    const finalScore = Math.max(puntos, 0);

    if (trimmedName) {
      const entry: LeaderboardEntry = {
        name: trimmedName,
        score: finalScore,
        playedAt: new Date().toISOString(),
      };

      guardarTop([...top, entry]);
    }

    setPuntos(0);
    setTiempo(20);
    setError(null);
    setPistas([]);
    borrarNombre();

    if (paises.length > 0) {
      const freshCountry = getRandomCountry(paises);
      setPaisActual(freshCountry);
    }
  }, [borrarNombre, paises, top, guardarTop, nombreJugador, puntos]);

  const pedirPista = useCallback(() => {
    if (!paisActual) {
      return;
    }

    setPistas((prevPistas) => {
      const hintPool = pistasFor(paisActual.name);
      const nextHints = [...prevPistas];

      for (const hint of hintPool) {
        if (!nextHints.includes(hint)) {
          nextHints.push(hint);
          break;
        }
      }

      return nextHints;
    });

    cambiarPuntos(-1);
  }, [cambiarPuntos, paisActual]);

  useEffect(() => {
    let active = true;

    const loadCountries = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('https://countriesnow.space/api/v0.1/countries/flag/images');
        const payload = await response.json();
        const list = Array.isArray(payload?.data) ? payload.data : [];
        const uniqueCountries = new Map<string, Country>();

        for (const entry of list) {
          const country = normalizeCountry(entry);

          if (country && !uniqueCountries.has(country.name)) {
            uniqueCountries.set(country.name, country);
          }
        }

        const normalized = Array.from(uniqueCountries.values());

        if (!active) {
          return;
        }

        setPaises(normalized);

        if (normalized.length > 0) {
          const initialCountry = getRandomCountry(normalized);
          setPaisActual(initialCountry);
        }
      } catch (loadError) {
        if (!active) {
          return;
        }

        console.error(loadError);
        setError('No se pudieron cargar los países. Intenta de nuevo.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    const hydrateSession = async () => {
      const savedName = await AsyncStorage.getItem(PLAYER_NAME_KEY);
      const savedTop = await leerTop();

      if (!active) {
        return;
      }

      const nextName = normalizarNombre(savedName ?? '');
      setNombreJugadorState(nextName);
      setTop(savedTop);
    };

    void loadCountries();
    void hydrateSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!paisActual || !puedeJugar) {
      return;
    }

    setTiempo(20);
    const timer = setInterval(() => {
      setTiempo((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            cambiarPuntos(-1);
            siguientePais();
          }, 0);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cambiarPuntos, puedeJugar, paisActual, siguientePais]);

  const adivinarPais = useCallback(
    (guess: string) => {
      if (!paisActual) {
        return;
      }

      const cleanedGuess = guess.trim();
      const answer = paisActual.name;
      const isCorrect =
        normalizarTexto(cleanedGuess) === normalizarTexto(answer) ||
        cleanedGuess.toLowerCase() === answer.toLowerCase();

      if (isCorrect) {
        cambiarPuntos(10);
      } else {
        cambiarPuntos(-1);
      }

      siguientePais();
    },
    [cambiarPuntos, paisActual, siguientePais]
  );

  const saltarPais = useCallback(() => {
    cambiarPuntos(-1);
    siguientePais();
  }, [cambiarPuntos, siguientePais]);

  const value = useMemo<GameContextType>(
    () => ({
      paises,
      paisActual,
      puntos,
      tiempo,
      pistas,
      isLoading,
      error,
      nombreJugador,
      top,
      puedeJugar,
      ponerNombre,
      borrarNombre,
      adivinarPais,
      saltarPais,
      reiniciarJuego,
      pedirPista,
    }),
    [paises, paisActual, puntos, tiempo, pistas, isLoading, error, nombreJugador, top, puedeJugar, ponerNombre, borrarNombre, adivinarPais, saltarPais, reiniciarJuego, pedirPista]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function usarJuego() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('usarJuego debe usarse dentro de ProveedorJuego');
  }

  return context;
}
