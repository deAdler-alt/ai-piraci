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
}

export const useGameEngine = (character: Character, onVictory?: () => void) => {
  // STARTUJEMY Z 50. To jest stan bezpieczny.
  const [state, setState] = useState<GameState>({
    messages: [],
    isThinking: false,
    convictionLevel: 50, 
    isGameOver: false,
    isWon: false,
    gameId: null
  });

  // 1. INICJALIZACJA GRY
  useEffect(() => {
    let mounted = true;

    const initGame = async () => {
      try {
        console.log("🚀 Frontend: Inicjalizacja gry...");
        
        // Resetujemy widok na start
        setState(prev => ({
            ...prev,
            messages: [],
            isGameOver: false,
            isWon: false,
            convictionLevel: 50, // Sztywny start
            isThinking: true
        }));

        // Pytamy backend o założenie gry
        const data = await gameService.startGame("easy", character.name); 
        
        if (mounted) {
          console.log("✅ Backend: Gra założona. ID:", data.game_id, "Score:", (data as any).merit_score);
          
          setState(prev => ({ 
            ...prev, 
            gameId: data.game_id,
            // Jeśli backend zwrócił już jakiś wynik (np. 50), bierzemy go. 
            // Jeśli zwrócił 0 (błąd), wymuszamy 50, żeby nie przegrać na starcie.
            convictionLevel: (data as any).merit_score > 0 ? (data as any).merit_score : 50,
            isThinking: false 
          }));
        }
      } catch (error) {
        console.error("❌ Błąd krytyczny startu:", error);
        if (mounted) setState(prev => ({ ...prev, isThinking: false }));
      }
    };

    initGame();

    return () => { mounted = false; };
  }, [character.id]);


  // 2. PĘTLA ROZGRYWKI
  const sendMessage = async (userText: string) => {
    if (!state.gameId || state.isGameOver) return;

    // Dodajemy wiadomość gracza
    const userMsg: Message = { 
        id: Date.now().toString(), 
        text: userText, 
        isPlayer: true,
        timestamp: Date.now(),
        type: 'text'
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isThinking: true
    }));

    try {
      // Wywołujemy backend
      const response = await gameService.sendMessage(userText);
      console.log("📩 Backend odpowiedział:", response);

      const pirateMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.pirate_response,
        isPlayer: false,
        timestamp: Date.now(),
        type: 'text'
      };

      setState(prev => {
        // --- LOGIKA STANU ---
        // Tu frontend staje się tylko wykonawcą woli backendu
        
        const backendScore = response.merit_score;
        const backendWon = response.is_won;

        // SANITY CHECK: Czy wygrana ma sens?
        // Nie chcemy mapy, jeśli pirat nas nienawidzi (score < 20)
        const isValidVictory = backendWon && backendScore > 20;

        // Przegrana następuje TYLKO gdy wynik spadnie do 0 (i nie wygraliśmy)
        const isLost = !isValidVictory && backendScore <= 0;

        if (isValidVictory && onVictory) {
           setTimeout(onVictory, 2000); // Daj chwilę nacieszyć się komunikatem
        }

        return {
          ...prev,
          messages: [...prev.messages, pirateMsg],
          convictionLevel: backendScore, // Ufamy backendowi
          isWon: isValidVictory,
          isGameOver: isValidVictory || isLost,
          isThinking: false
        };
      });

    } catch (error) {
      console.error("Błąd komunikacji:", error);
      setState(prev => ({ 
        ...prev, 
        isThinking: false,
        messages: [...prev.messages, { 
            id: Date.now().toString(), 
            text: "☠️ (Błąd sieci... Spróbuj jeszcze raz)", 
            isPlayer: false,
            timestamp: Date.now(),
            type: 'system'
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