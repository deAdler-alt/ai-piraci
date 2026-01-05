import { useState, useEffect } from 'react';
import { Message, Character } from '../../core/types';
import { gameService } from '../../services/game.service'; 

interface GameState {
  messages: Message[];
  isThinking: boolean;
  convictionLevel: number;
  isGameOver: boolean;
  isWon: boolean;
  gameId: string | null;
  currentEmotion: string;
  turnCount: number;
}

export const useGameEngine = (character: Character, onVictory?: () => void) => {
  // START: 50% (Neutral)
  const [state, setState] = useState<GameState>({
    messages: [],
    isThinking: false,
    convictionLevel: 50, 
    isGameOver: false,
    isWon: false,
    gameId: null,
    currentEmotion: "idle",
    turnCount: 0
  });

  // Funkcja czyszcząca (na wszelki wypadek, gdyby LLM coś wypluł)
  const cleanResponse = (text: string) => {
    return text.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim();
  };

  // 1. INICJALIZACJA
  useEffect(() => {
    let mounted = true;
    const initGame = async () => {
      try {
        // Reset
        setState(prev => ({ 
            ...prev, messages: [], isGameOver: false, isWon: false, 
            convictionLevel: 50, isThinking: true, currentEmotion: "idle", turnCount: 0 
        }));

        const data = await gameService.startGame("easy", character.name); 
        
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            gameId: data.game_id, 
            convictionLevel: 50, // Ignorujemy startowe 0 z backendu
            isThinking: false 
          }));
        }
      } catch (error) {
        console.error("Start error:", error);
        if (mounted) setState(prev => ({ ...prev, isThinking: false }));
      }
    };
    initGame();
    return () => { mounted = false; };
  }, [character.id]);

  // 2. ROZMOWA
  const sendMessage = async (userText: string) => {
    if (!state.gameId || state.isGameOver) return;

    const userMsg: Message = { 
        id: Date.now().toString(), text: userText, isPlayer: true, timestamp: Date.now(), type: 'text' 
    };

    setState(prev => ({
      ...prev, messages: [...prev.messages, userMsg], isThinking: true, currentEmotion: "thinking", turnCount: prev.turnCount + 1
    }));

    try {
      const response = await gameService.sendMessage(userText);
      const cleanText = cleanResponse(response.pirate_response);

      const pirateMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: cleanText || "...",
        isPlayer: false, timestamp: Date.now(), type: 'text' 
      };

      setState(prev => {
        const newScore = response.merit_score;
        const oldScore = prev.convictionLevel;
        const currentTurn = prev.turnCount;

        // --- LOGIKA EMOCJI OPARTA NA WYNIKU ---
        let emotion = "idle";
        if (newScore > oldScore) emotion = "happy";       // Rośnie -> Cieszy się
        else if (newScore < oldScore) emotion = "angry";  // Spada -> Złości się
        else emotion = "thinking";                        // Bez zmian -> Myśli/Neutralny

        // --- LOGIKA WYGRANEJ ---
        // Wymagamy: Flagi backendu + Minimum 2 tur (żeby była rozmowa)
        const isWon = response.is_won && currentTurn >= 2;
        
        // Przegrana: Tylko jak spadnie do 0 (i nie wygraliśmy)
        const isLost = !isWon && newScore <= 0;

        if (isWon) emotion = "happy"; // Wygrana = zawsze happy
        if (isLost) emotion = "angry"; // Przegrana = zawsze angry

        if (isWon && onVictory) setTimeout(onVictory, 1500);

        return {
          ...prev,
          messages: [...prev.messages, pirateMsg],
          convictionLevel: newScore,
          isWon: isWon,
          isGameOver: isWon || isLost,
          isThinking: false,
          currentEmotion: emotion
        };
      });

    } catch (error) {
      console.error(error);
      setState(prev => ({ 
        ...prev, isThinking: false, currentEmotion: "angry",
        messages: [...prev.messages, { id: Date.now().toString(), text: "☠️ (Błąd sieci)", isPlayer: false, timestamp: Date.now(), type: 'system' }] 
      }));
    }
  };

  return {
    messages: state.messages,
    isThinking: state.isThinking,
    convictionLevel: state.convictionLevel,
    isGameOver: state.isGameOver,
    isWon: state.isWon,
    currentEmotion: state.currentEmotion,
    sendMessage
  };
};