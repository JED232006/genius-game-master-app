import { useState, useCallback, useEffect } from 'react';
import { BluetoothMessage } from './useBluetoothConnection';

export interface GameState {
  players: {
    id: number;
    score: number;
    isActive: boolean;
  }[];
  activePlayer: number | null;
  timerActive: boolean;
  gameStatus: 'waiting' | 'active' | 'finished';
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    players: [
      { id: 1, score: 0, isActive: false },
      { id: 2, score: 0, isActive: false },
      { id: 3, score: 0, isActive: false },
      { id: 4, score: 0, isActive: false },
    ],
    activePlayer: null,
    timerActive: false,
    gameStatus: 'waiting'
  });

  // Listen for Bluetooth messages
  useEffect(() => {
    const handleBluetoothMessage = (event: CustomEvent<BluetoothMessage>) => {
      const message = event.detail;
      
      if (message.type === 'BUTTON_PRESS') {
        handleButtonPress(message.playerId);
      }
    };

    window.addEventListener('bluetoothMessage', handleBluetoothMessage as EventListener);
    
    return () => {
      window.removeEventListener('bluetoothMessage', handleBluetoothMessage as EventListener);
    };
  }, []);

  const handleButtonPress = useCallback((playerId: number) => {
    setGameState(prev => {
      // Only allow button press if no player is currently active
      if (prev.activePlayer !== null || prev.timerActive) {
        return prev;
      }

      return {
        ...prev,
        activePlayer: playerId,
        timerActive: true,
        gameStatus: 'active',
        players: prev.players.map(player => ({
          ...player,
          isActive: player.id === playerId
        }))
      };
    });
  }, []);

  const handleTimerEnd = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      activePlayer: null,
      timerActive: false,
      gameStatus: 'waiting',
      players: prev.players.map(player => ({
        ...player,
        isActive: false
      }))
    }));
  }, []);

  const updateScore = useCallback((playerId: number, delta: number) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(player => {
        if (player.id === playerId) {
          const newScore = Math.max(0, Math.min(9, player.score + delta));
          return { ...player, score: newScore };
        }
        return player;
      })
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      players: [
        { id: 1, score: 0, isActive: false },
        { id: 2, score: 0, isActive: false },
        { id: 3, score: 0, isActive: false },
        { id: 4, score: 0, isActive: false },
      ],
      activePlayer: null,
      timerActive: false,
      gameStatus: 'waiting'
    });
  }, []);

  const manualActivatePlayer = useCallback((playerId: number) => {
    // For testing purposes - manually activate a player
    handleButtonPress(playerId);
  }, [handleButtonPress]);

  return {
    gameState,
    updateScore,
    handleTimerEnd,
    resetGame,
    manualActivatePlayer
  };
}