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

type GameContextType = {
  countries: Country[];
  currentCountry: Country | null;
  score: number;
  timeLeft: number;
  hints: string[];
  isLoading: boolean;
  error: string | null;
  guessCountry: (guess: string) => void;
  nextCountry: () => void;
  skipCountry: () => void;
  resetGame: () => void;
  requestHint: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

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

export function GameProvider({ children }: { children: ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [hints, setHints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyScoreChange = useCallback((delta: number) => {
    setScore((prev) => prev + delta);
  }, []);

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

  const resetGame = useCallback(() => {
    setScore(0);
    setTimeLeft(20);
    setError(null);
    setHints([]);

    if (countries.length > 0) {
      const freshCountry = getRandomCountry(countries);
      setCurrentCountry(freshCountry);
    }
  }, [countries]);

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

  const guessCountry = useCallback(
    (guess: string) => {
      if (!currentCountry) {
        return;
      }

      const cleanedGuess = guess.trim();
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
      guessCountry,
      nextCountry,
      skipCountry,
      resetGame,
      requestHint,
    }),
    [countries, currentCountry, score, timeLeft, hints, isLoading, error, guessCountry, nextCountry, skipCountry, resetGame, requestHint]
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
