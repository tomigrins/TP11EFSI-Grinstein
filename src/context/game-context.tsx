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
  id: string;
  name: string;
  score: number;
};

type GameContextType = {
  countries: Country[];
  currentCountry: Country | null;
  score: number;
  timeLeft: number;
  hints: string[];
  isLoading: boolean;
  error: string | null;
  playerName: string;
  leaderboard: LeaderboardEntry[];
  setPlayerName: (nextName: string) => void;
  guess: (guess: string) => void;
  guessCountry: (guess: string) => void;
  nextCountry: () => void;
  skipCountry: () => void;
  resetGame: () => void;
  resetScore: () => void;
  requestHint: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);
const LEADERBOARD_STORAGE_KEY = 'guess-country-leaderboard-v1';

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const sanitizePlayerName = (value: string) => value.replace(/\s+/g, ' ').trim().slice(0, 18);

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

  const filtered = exclude ? countries.filter((country) => country.name !== exclude.name) : countries;
  const source = filtered.length > 0 ? filtered : countries;

  return source[Math.floor(Math.random() * source.length)] ?? null;
};

const buildHints = (countryName: string) => {
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

const normalizeLeaderboardEntries = (entries: unknown[]): LeaderboardEntry[] => {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object')
    .filter((entry) => typeof entry.name === 'string' && Number.isFinite(entry.score))
    .map((entry) => ({
      id: typeof entry.id === 'string' ? entry.id : `${String(entry.name).toLowerCase()}-${Date.now()}`,
      name: sanitizePlayerName(String(entry.name)),
      score: Number(entry.score),
    }))
    .filter((entry) => entry.name.length > 0)
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
    .slice(0, 10);
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [hints, setHints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerNameState] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isStorageReady, setIsStorageReady] = useState(false);

  const setPlayerName = useCallback((nextName: string) => {
    setPlayerNameState(sanitizePlayerName(nextName));
  }, []);

  const syncCurrentPlayerScore = useCallback(
    (nextScore: number) => {
      const currentPlayer = sanitizePlayerName(playerName);

      if (!currentPlayer) {
        return;
      }

      setLeaderboard((previous) => {
        const withoutCurrentPlayer = previous.filter(
          (entry) => entry.name.toLowerCase() !== currentPlayer.toLowerCase()
        );

        const existingEntry = previous.find(
          (entry) => entry.name.toLowerCase() === currentPlayer.toLowerCase()
        );

        const bestScore = Math.max(existingEntry?.score ?? Number.NEGATIVE_INFINITY, nextScore);

        const updatedEntry: LeaderboardEntry = {
          id: existingEntry?.id ?? `${currentPlayer.toLowerCase()}-${Date.now()}`,
          name: currentPlayer,
          score: bestScore,
        };

        return [...withoutCurrentPlayer, updatedEntry]
          .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
          .slice(0, 10);
      });
    },
    [playerName]
  );

  useEffect(() => {
    const hydrateLeaderboard = async () => {
      try {
        const rawValue = await AsyncStorage.getItem(LEADERBOARD_STORAGE_KEY);

        if (!rawValue) {
          setIsStorageReady(true);
          return;
        }

        const parsed = JSON.parse(rawValue);
        setLeaderboard(normalizeLeaderboardEntries(parsed));
      } catch (storageError) {
        console.error(storageError);
      } finally {
        setIsStorageReady(true);
      }
    };

    hydrateLeaderboard();
  }, []);

  useEffect(() => {
    if (!isStorageReady) {
      return;
    }

    AsyncStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboard)).catch((storageError) => {
      console.error(storageError);
    });
  }, [leaderboard, isStorageReady]);

  const applyScoreChange = useCallback(
    (delta: number) => {
      setScore((previous) => {
        const nextScore = previous + delta;
        syncCurrentPlayerScore(nextScore);
        return nextScore;
      });
    },
    [syncCurrentPlayerScore]
  );

  const nextCountry = useCallback(() => {
    const chosenCountry = getRandomCountry(countries, currentCountry);

    if (!chosenCountry) {
      setCurrentCountry(null);
      setHints([]);
      setTimeLeft(0);
      return;
    }

    setCurrentCountry(chosenCountry);
    setHints([]);
    setTimeLeft(20);
  }, [countries, currentCountry]);

  const resetScore = useCallback(() => {
    setScore(0);
    setHints([]);
    setTimeLeft(20);
    setError(null);

    if (countries.length > 0) {
      const freshCountry = getRandomCountry(countries);
      setCurrentCountry(freshCountry);
    }
  }, [countries]);

  const resetGame = useCallback(() => {
    resetScore();
    setPlayerNameState('');
  }, [resetScore]);

  const requestHint = useCallback(() => {
    if (!currentCountry) {
      return;
    }

    setHints((prevHints) => {
      const hintPool = buildHints(currentCountry.name);
      const nextHints = [...prevHints];

      for (const hint of hintPool) {
        if (!nextHints.includes(hint)) {
          nextHints.push(hint);
          break;
        }
      }

      return nextHints;
    });

    applyScoreChange(-1);
  }, [applyScoreChange, currentCountry]);

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

        setCountries(normalized);

        if (normalized.length > 0) {
          const initialCountry = getRandomCountry(normalized);
          setCurrentCountry(initialCountry);
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

    loadCountries();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!currentCountry) {
      return;
    }

    setTimeLeft(20);
    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            applyScoreChange(-1);
            nextCountry();
          }, 0);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [applyScoreChange, currentCountry, nextCountry]);

  const guess = useCallback(
    (guessValue: string) => {
      if (!currentCountry) {
        return;
      }

      const cleanedGuess = guessValue.trim();
      const answer = currentCountry.name;
      const isCorrect =
        normalizeText(cleanedGuess) === normalizeText(answer) ||
        cleanedGuess.toLowerCase() === answer.toLowerCase();

      if (isCorrect) {
        applyScoreChange(10);
      } else {
        applyScoreChange(-1);
      }

      nextCountry();
    },
    [applyScoreChange, currentCountry, nextCountry]
  );

  const guessCountry = guess;

  const skipCountry = useCallback(() => {
    applyScoreChange(-1);
    nextCountry();
  }, [applyScoreChange, nextCountry]);

  const value = useMemo<GameContextType>(
    () => ({
      countries,
      currentCountry,
      score,
      timeLeft,
      hints,
      isLoading,
      error,
      playerName,
      leaderboard,
      setPlayerName,
      guess,
      guessCountry,
      nextCountry,
      skipCountry,
      resetGame,
      resetScore,
      requestHint,
    }),
    [countries, currentCountry, score, timeLeft, hints, isLoading, error, playerName, leaderboard, setPlayerName, guess, nextCountry, skipCountry, resetGame, resetScore, requestHint]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('useGameContext debe usarse dentro de GameProvider');
  }

  return context;
}