import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MultiplayerGame, Player, MultiplayerResults } from '../types/multiplayer';
import { Character } from '../types/characters';
import { characterData } from '../data/characters';

interface MultiplayerContextType {
  currentGame: MultiplayerGame | null;
  setCurrentGame: (game: MultiplayerGame | null) => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
  botCount: number;
  setBotCount: (count: number) => void;
  selectedBots: Character[];
  setSelectedBots: (bots: Character[]) => void;
  problemCount: number;
  setProblemCount: (count: number) => void;
  timePerProblem: number;
  setTimePerProblem: (time: number) => void;
  elapsedTime: number;
  setElapsedTime: (time: number) => void;
  isGameActive: boolean;
  setIsGameActive: (active: boolean) => void;
  gameResults: MultiplayerResults | null;
  setGameResults: (results: MultiplayerResults | null) => void;
  updatePlayerScore: (playerId: string, correctAnswers: number) => void;
  updateBotScores: () => void;
  resetGame: () => void;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};

export const MultiplayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentGame, setCurrentGame] = useState<MultiplayerGame | null>(null);
  const [players, setPlayers] = useState<Player[]>([
    { id: 'player1', name: 'Player 1', isBot: false, score: 0, progress: 0, correctAnswers: 0, isFinished: false }
  ]);
  const [botCount, setBotCount] = useState<number>(1);
  const [selectedBots, setSelectedBots] = useState<Character[]>([]);
  const [problemCount, setProblemCount] = useState<number>(10);
  const [timePerProblem, setTimePerProblem] = useState<number>(60);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [gameResults, setGameResults] = useState<MultiplayerResults | null>(null);

  const updatePlayerScore = (playerId: string, correctAnswers: number) => {
    setPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        const accuracy = (correctAnswers / problemCount) * 100;
        const targetTime = problemCount * timePerProblem;
        const timeScore = Math.min(100, (targetTime * 0.8) / elapsedTime * 100);
        const totalScore = Math.round((accuracy * 0.6) + (timeScore * 0.4));
        
        return {
          ...player,
          correctAnswers,
          score: totalScore,
          progress: 100,
          isFinished: true,
          completionTime: elapsedTime
        };
      }
      return player;
    }));
  };

  const updateBotScores = () => {
    setPlayers(prev => prev.map(player => {
      if (player.isBot && player.character && !player.isFinished) {
        const character = player.character;
        const accuracy = character.stats.accuracy / 10;
        const speed = character.stats.speed / 10;
        const consistency = character.stats.consistency / 10;
        
        // Calculate bot completion time with some randomness
        const baseTime = problemCount * timePerProblem * (1.2 - speed * 0.4);
        const randomVariation = (1 - consistency) * 0.3;
        const completionTime = Math.round(baseTime * (1 + (Math.random() - 0.5) * randomVariation));
        
        // Calculate bot accuracy with randomness
        const baseAccuracy = accuracy * 100;
        const accuracyVariation = (1 - consistency) * (Math.random() * 20 - 10);
        const finalAccuracy = Math.max(0, Math.min(100, baseAccuracy + accuracyVariation));
        
        const correctAnswers = Math.round((finalAccuracy / 100) * problemCount);
        const timeScore = Math.min(100, (problemCount * timePerProblem * 0.8) / completionTime * 100);
        const totalScore = Math.round((finalAccuracy * 0.6) + (timeScore * 0.4));
        
        return {
          ...player,
          correctAnswers,
          score: totalScore,
          progress: 100,
          isFinished: true,
          completionTime
        };
      }
      return player;
    }));
  };

  const resetGame = () => {
    setCurrentGame(null);
    setPlayers(prev => prev.map(player => ({
      ...player,
      score: 0,
      progress: 0,
      correctAnswers: 0,
      isFinished: false,
      completionTime: undefined
    })));
    setElapsedTime(0);
    setIsGameActive(false);
    setGameResults(null);
  };

  return (
    <MultiplayerContext.Provider
      value={{
        currentGame,
        setCurrentGame,
        players,
        setPlayers,
        botCount,
        setBotCount,
        selectedBots,
        setSelectedBots,
        problemCount,
        setProblemCount,
        timePerProblem,
        setTimePerProblem,
        elapsedTime,
        setElapsedTime,
        isGameActive,
        setIsGameActive,
        gameResults,
        setGameResults,
        updatePlayerScore,
        updateBotScores,
        resetGame,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};