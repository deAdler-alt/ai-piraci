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
    convictionLevel: 50,
    isGameOver: false,
    isWon: false,
    gameId: null
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. ROZPOCZĘCIE GRY
  useEffect(() => {
    let mounted = true;

    const initGame = async () => {
      try {
        console.log("Rozpoczynam nową grę z:", character.name);
        // Reset stanu
        setState(prev => ({ ...prev, messages: [], isGameOver: false, isWon: false, convictionLevel: 50, isThinking: true }));

        const data = await gameService.startGame("easy", character.name); 
        
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            gameId: data.game_id,
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

    // A. Dodaj wiadomość gracza (Z POPRAWKĄ TIMESTAMP)
    const userMsg: Message = { 
        id: Date.now().toString(), 
        text: userText, 
        isPlayer: true,
        timestamp: Date.now() // <--- DODANO
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isThinking: true
    }));

    try {
      const response = await gameService.sendMessage(userText);

      // B. Dodaj odpowiedź pirata (Z POPRAWKĄ TIMESTAMP)
      const pirateMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.pirate_response,
        isPlayer: false,
        timestamp: Date.now() // <--- DODANO
      };

      setState(prev => {
        const isWon = response.is_won;
        const isLost = response.merit_score <= 0;

        if ((isWon || isLost) && onGameEnd) {
           setTimeout(() => onGameEnd(isWon), 1000);
        }

        return {
          ...prev,
          messages: [...prev.messages, pirateMsg],
          convictionLevel: response.merit_score,
          isWon: isWon,
          isGameOver: isWon || isLost,
          isThinking: false
        };
      });

      if (response.audio_url) {
        const audio = new Audio(response.audio_url);
        audio.play().catch(e => console.error("Błąd audio:", e));
      }

    } catch (error) {
      console.error("Błąd wysyłania:", error);
      
      // C. Dodaj wiadomość błędu (Z POPRAWKĄ TIMESTAMP - TO NAPRAWIA TWÓJ BŁĄD)
      setState(prev => ({ 
        ...prev, 
        isThinking: false,
        messages: [...prev.messages, { 
            id: Date.now().toString(), 
            text: "Papuga zerwała łącze...", 
            isPlayer: false,
            timestamp: Date.now() // <--- DODANO (To naprawia czerwone podkreślenie)
        }]
      }));
    }
  };

  return {
    messages: state.messages,
    isThinking: state.isThinking,
    convictionLevel: state.convictionLevel,
    isGameOver: state.isGameOver,
    isWon: state.isWon,
    sendMessage
  };
};