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
  const [state, setState] = useState<GameState>({
    messages: [],
    isThinking: false,
    convictionLevel: 50, // STARTUJEMY Z 50%
    isGameOver: false,
    isWon: false,
    gameId: null,
    currentEmotion: "idle",
    turnCount: 0
  });

  // --- FUNKCJA CZYSZCZĄCA (SANITIZER) ---
  const sanitizeResponse = (rawText: string) => {
    let emotion = "idle";
    const upperText = rawText.toUpperCase();
    
    // Prosta detekcja emocji
    if (upperText.includes("HAPPY") || upperText.includes("RADOŚĆ")) emotion = "happy";
    else if (upperText.includes("ANGRY") || upperText.includes("ZŁOŚĆ")) emotion = "angry";
    else if (upperText.includes("THINKING") || upperText.includes("MYŚLI")) emotion = "thinking";
    
    // Brutalne wycinanie tagów [] () * *
    let cleanText = rawText
        .replace(/\[.*?\]/g, "") 
        .replace(/\(.*?\)/g, "")
        .replace(/\*.*?\*/g, "")
        .trim();

    if (cleanText.length === 0) cleanText = "...";

    return { emotion, cleanText };
  };

  // 1. START GRY
  useEffect(() => {
    let mounted = true;
    const initGame = async () => {
      try {
        // TWARDY RESET - ZAWSZE 50% NA START
        setState({ 
            messages: [], isGameOver: false, isWon: false, 
            convictionLevel: 50, isThinking: true, 
            currentEmotion: "idle", turnCount: 0, gameId: null 
        });

        const data = await gameService.startGame("easy", character.name); 
        
        if (mounted) {
          setState(prev => ({ 
            ...prev, gameId: data.game_id, 
            convictionLevel: 50, // IGNORUJEMY to co zwrócił backend na start
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

  // 2. WYSYŁANIE WIADOMOŚCI
  const sendMessage = async (userText: string) => {
    if (!state.gameId || state.isGameOver) return;

    const userMsg: Message = { 
        id: Date.now().toString(), text: userText, isPlayer: true, timestamp: Date.now(), type: 'text' 
    };

    setState(prev => ({
      ...prev, messages: [...prev.messages, userMsg], isThinking: true, currentEmotion: "thinking", 
      turnCount: prev.turnCount + 1 // Podbijamy licznik tur
    }));

    try {
      const response = await gameService.sendMessage(userText);
      const { emotion, cleanText } = sanitizeResponse(response.pirate_response);

      const pirateMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: cleanText, 
        isPlayer: false, timestamp: Date.now(), type: 'text' 
      };

      setState(prev => {
        let score = response.merit_score;
        const currentTurn = prev.turnCount;

        // --- OKRES OCHRONNY (IMMUNITY) ---
        // Przez pierwsze 2 tury NIE MOŻNA PRZEGRAĆ, nawet jak score spadnie do 0.
        const isSafePeriod = currentTurn < 2;

        if (isSafePeriod && score <= 10) {
            score = 30; // Sztucznie podtrzymujemy życie wizualnie
        }

        // --- WARUNKI KOŃCOWE ---
        // 1. Wygrana: Backend = TAK + Wysoki Wynik + Min. 2 tury
        const validWin = response.is_won && score > 60 && !isSafePeriod;
        
        // 2. Przegrana: Wynik = 0 + To NIE jest okres ochronny
        const validLoss = !validWin && score <= 0 && !isSafePeriod;

        if (validWin && onVictory) setTimeout(onVictory, 2000);

        return {
          ...prev,
          messages: [...prev.messages, pirateMsg],
          convictionLevel: score,
          isWon: validWin,
          isGameOver: validWin || validLoss, // Tu blokujemy przegraną w safe period
          isThinking: false,
          currentEmotion: validWin ? "happy" : (validLoss ? "angry" : emotion)
        };
      });

    } catch (error) {
      console.error("Chat error:", error);
      setState(prev => ({ 
        ...prev, isThinking: false, currentEmotion: "angry",
        messages: [...prev.messages, { id: Date.now().toString(), text: "☠️ (Błąd komunikacji)", isPlayer: false, timestamp: Date.now(), type: 'system' }] 
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