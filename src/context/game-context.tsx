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

export type Player = {
  id: number;
  name: string;
  score: number;
};

type GameContextType = {
  countries: Country[];
  currentCountry: Country | null;
  score: number;
  players: Player[];
  timeLeft: number;
  hints: string[];
  isLoading: boolean;
  error: string | null;
  guessCountry: (guess: string) => void;
  nextCountry: () => void;
  resetGame: () => void;
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

  return {
    name,
    flag: flagUrl,
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
    'Es un país disponible en la base de datos.',
  ];
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [score, setScore] = useState(0);
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Jugador 1', score: 0 },
    { id: 2, name: 'Jugador 2', score: 0 },
  ]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [hints, setHints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyScoreChange = useCallback((delta: number) => {
    setScore((prev) => prev + delta);
    setPlayers((prevPlayers) =>
      prevPlayers.map((player, index) =>
        index === 0 ? { ...player, score: player.score + delta } : player
      )
    );
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
    setHints(buildHints(chosenCountry.name));
    setTimeLeft(20);
  }, [countries, currentCountry]);

  const resetGame = useCallback(() => {
    setScore(0);
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => ({ ...player, score: 0 }))
    );
    setTimeLeft(20);
    setError(null);

    if (countries.length > 0) {
      const freshCountry = getRandomCountry(countries);
      setCurrentCountry(freshCountry);
      if (freshCountry) {
        setHints(buildHints(freshCountry.name));
      }
    }
  }, [countries]);

  useEffect(() => {
    let active = true;

    const loadCountries = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('https://countriesnow.space/api/v0.1/countries/flag/images');
        const payload = await response.json();
        const list = Array.isArray(payload?.data) ? payload.data : [];
        const normalized = list
          .map(normalizeCountry)
          .filter((country): country is Country => country !== null);

        if (!active) {
          return;
        }

        setCountries(normalized);

        if (normalized.length > 0) {
          const initialCountry = getRandomCountry(normalized);
          setCurrentCountry(initialCountry);
          if (initialCountry) {
            setHints(buildHints(initialCountry.name));
          }
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

  const value = useMemo<GameContextType>(
    () => ({
      countries,
      currentCountry,
      score,
      players,
      timeLeft,
      hints,
      isLoading,
      error,
      guessCountry,
      nextCountry,
      resetGame,
    }),
    [countries, currentCountry, score, players, timeLeft, hints, isLoading, error, guessCountry, nextCountry, resetGame]
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
