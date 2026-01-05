// src/app/hooks/useGameEngine.ts

import { useState, useEffect, useRef } from 'react';
import { Message, Character } from '../../core/types';
import { gameService } from '../../services/game.service'; 

interface GameState {
  messages: Message[];
  isThinking: boolean;
  convictionLevel: number;
  isGameOver: boolean;
  isWon: boolean;
  gameId: string | null;
}

export const useGameEngine = (character: Character, onGameEnd?: (won: boolean) => void) => {
  const [state, setState] = useState<GameState>({
    messages: [],
    isThinking: false,
    convictionLevel: 50, // Startujemy od środka (0-100)
    isGameOver: false,
    isWon: false,
    gameId: null
  });

  // 1. ROZPOCZĘCIE GRY
  useEffect(() => {
    let mounted = true;

    const initGame = async () => {
      try {
        console.log("🚀 Rozpoczynam nową grę z:", character.name);
        
        // Reset stanu przy zmianie postaci
        setState(prev => ({ 
            ...prev, 
            messages: [], 
            isGameOver: false, 
            isWon: false, 
            convictionLevel: 50, // Reset paska
            isThinking: true 
        }));

        const data = await gameService.startGame("easy", character.name); 
        
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            gameId: data.game_id,
            // Jeśli backend zwraca początkowy merit przy starcie, użyj go, inaczej 50
            convictionLevel: (data as any).merit_score ?? 50, 
            isThinking: false 
          }));
        }
      } catch (error) {
        console.error("Błąd startu gry:", error);
        if (mounted) setState(prev => ({ ...prev, isThinking: false }));
      }
    };

    initGame();

    return () => { mounted = false; };
  }, [character.id]);


  // 2. WYSYŁANIE WIADOMOŚCI
  const sendMessage = async (userText: string) => {
    if (!state.gameId || state.isGameOver) return;

    // A. Wiadomość Gracza
    const userMsg: Message = { 
        id: Date.now().toString(), 
        text: userText, 
        isPlayer: true,
        timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isThinking: true
    }));

    try {
      const response = await gameService.sendMessage(userText);

      // B. Wiadomość Pirata
      const pirateMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.pirate_response,
        isPlayer: false,
        timestamp: Date.now()
      };

      setState(prev => {
        const isWon = response.is_won; 
        // Warunek przegranej: Merit spada do 0 (lub backend zwraca flagę przegranej, jeśli taką dodacie)
        const isLost = response.merit_score <= 0; 

        if ((isWon || isLost) && onGameEnd) {
           setTimeout(() => onGameEnd(isWon), 1500); // Małe opóźnienie dla efektu
        }

        return {
          ...prev,
          messages: [...prev.messages, pirateMsg],
          convictionLevel: response.merit_score, // Tu naprawiamy NaN - bierzemy prosto z backendu
          isWon: isWon,
          isGameOver: isWon || isLost,
          isThinking: false
        };
      });

      // --- 4. WYCISZENIE TTS (Hot Fix) ---
      // Zakomentowane na czas demo
      /* if (response.audio_url) {
        const audio = new Audio(response.audio_url);
        audio.play().catch(e => console.error("Błąd audio:", e));
      }
      */

    } catch (error) {
      console.error("Błąd wysyłania:", error);
      
      setState(prev => ({ 
        ...prev, 
        isThinking: false,
        messages: [...prev.messages, { 
            id: Date.now().toString(), 
            text: "☠️ (Papuga zerwała łącze...)", 
            isPlayer: false,
            timestamp: Date.now()
        }]
      }));
    }
  };

  return {
    messages: state.messages,
    isThinking: state.isThinking,
    convictionLevel: state.convictionLevel, // Upewnij się, że UI obsługuje liczbę 0-100
    isGameOver: state.isGameOver,
    isWon: state.isWon,
    sendMessage
  };
};