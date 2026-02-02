import { useState, useEffect, useRef } from 'react';
import { Message, Character } from '../../core/types';
import { gameService } from '../../services/game.service'; 

// Definicja statystyk (Rankingu)
export interface GameStats {
  technique: number;
  style: number;
  total: number;
  grade: string;
}

interface GameState {
  messages: Message[];
  isThinking: boolean;
  convictionLevel: number;
  displayPercent: number;
  isGameOver: boolean;
  isWon: boolean;
  gameId: string | null;
  currentEmotion: string;
  turnCount: number;
}

export const useGameEngine = (character: Character, onVictory?: (stats: GameStats) => void, onGameOver?: () => void) => {
  const [state, setState] = useState<GameState>({
    messages: [],
    isThinking: false,
    convictionLevel: 0,
    displayPercent: 50,
    isGameOver: false,
    isWon: false,
    gameId: null,
    currentEmotion: "idle",
    turnCount: 0
  });

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- STATYSTYKI (Frontendowa wizualizacja) ---
  const calculateStats = (percent: number, turns: number): GameStats => {
    const technique = percent;
    // Bonus za styl: Im mniej tur, tym więcej punktów (max 20)
    let style = 20 - Math.max(0, (turns - 3) * 2);
    if (style < 0) style = 0;
    
    const total = technique + style;

    let grade = "Majtek";
    if (total >= 115) grade = "Legenda Siedmiu Mórz";
    else if (total >= 100) grade = "Postrach Oceanów";
    else if (total >= 85) grade = "Kapitan";
    else if (total >= 70) grade = "Korsarz";
    else if (total >= 50) grade = "Bosman";

    return { technique, style, total, grade };
  };

  const mapScoreToPercent = (backendScore: number) => {
    // Backend daje wynik od -100 do 100.
    // Mapujemy to na 0-100 dla paska postępu w UI.
    const clamped = Math.max(-100, Math.min(100, backendScore));
    return Math.round((clamped + 100) / 2);
  };

  const sanitizeResponse = (rawText: string) => {
    let emotion = "idle";
    const upperText = rawText.toUpperCase();
    if (upperText.includes("HAPPY") || upperText.includes("RADOŚĆ")) emotion = "happy";
    else if (upperText.includes("ANGRY") || upperText.includes("ZŁOŚĆ")) emotion = "angry";
    else if (upperText.includes("THINKING") || upperText.includes("MYŚLI")) emotion = "thinking";
    
    let cleanText = rawText.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").replace(/\*.*?\*/g, "").trim();
    if (cleanText.length === 0) cleanText = "...";
    return { emotion, cleanText };
  };

  useEffect(() => {
    let mounted = true;
    const initGame = async () => {
      try {
        setState({ 
            messages: [], isGameOver: false, isWon: false, 
            convictionLevel: 0, displayPercent: 50, isThinking: true, 
            currentEmotion: "idle", turnCount: 0, gameId: null 
        });
        const data = await gameService.startGame("easy", character.name); 
        if (mounted) setState(prev => ({ ...prev, gameId: data.game_id, convictionLevel: 0, displayPercent: 50, isThinking: false }));
      } catch (error) { console.error("Start error:", error); if (mounted) setState(prev => ({ ...prev, isThinking: false })); }
    };
    initGame();
    
    return () => { 
        mounted = false; 
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
    };
  }, [character.id]);

  const sendMessage = async (userText: string) => {
    if (!state.gameId || state.isGameOver) return;

    // 1. Pokaż wiadomość gracza
    const userMsg: Message = { id: Date.now().toString(), text: userText, isPlayer: true, timestamp: Date.now(), type: 'text' };
    setState(prev => ({ ...prev, messages: [...prev.messages, userMsg], isThinking: true, currentEmotion: "thinking", turnCount: prev.turnCount + 1 }));

    try {
      // 2. Zapytanie do backendu
      const response = await gameService.sendMessage(userText);
      
      const { emotion, cleanText } = sanitizeResponse(response.pirate_response);
      const pirateMsg: Message = { id: (Date.now() + 1).toString(), text: cleanText, isPlayer: false, timestamp: Date.now(), type: 'text' };

      // 3. ODBIÓR FLAG Z BACKENDU (SOURCE OF TRUTH)
      const isWin = response.is_won;   
      const isLoss = response.is_lost; 
      
      const rawScore = response.merit_score;
      const percentScore = mapScoreToPercent(rawScore);
      
      const stats = calculateStats(percentScore, state.turnCount + 1);

      // Funkcja: Wyświetlenie tekstu pirata (BEZ KOŃCZENIA GRY JESZCZE)
      const showTextAndSetState = () => {
        setState(prev => ({
            ...prev,
            messages: [...prev.messages, pirateMsg], // Dodajemy tekst
            convictionLevel: rawScore,
            displayPercent: percentScore,
            // WAŻNE: Tu wstrzymujemy zmianę flag isWon/isGameOver w UI!
            // Dzięki temu interfejs nie znika, a pirat może mówić.
            isWon: false, 
            isGameOver: false, 
            isThinking: false, 
            currentEmotion: isWin ? "happy" : (isLoss ? "angry" : emotion)
        }));
      };

      // Funkcja: FAKTYCZNY Koniec gry (zmiana ekranu)
      // Wywołamy to dopiero po zakończeniu audio
      const handleGameEnd = () => {
        console.log("🏁 Weryfikacja końca gry:", { isWin, isLoss });
        if (isWin && onVictory) {
            onVictory(stats);
        } else if (isLoss && onGameOver) {
            onGameOver();
        }
      };

      // 4. SYNCHRONIZACJA Z AUDIO
      if (response.audio_url) {
          const audio = new Audio(response.audio_url);
          currentAudioRef.current = audio;

          // A. START: Pokaż tekst dopiero gdy audio faktycznie ruszy (synchronizacja startu)
          audio.onplay = () => {
              showTextAndSetState();
          };

          // B. KONIEC: Zmień ekran dopiero gdy skończy gadać (synchronizacja końca)
          audio.onended = () => {
              handleGameEnd();
          };

          // C. BŁĄD: Jeśli audio nie działa, pokaż tekst i zakończ z opóźnieniem
          audio.onerror = () => {
              console.warn("Audio error, fallback to text.");
              showTextAndSetState();
              setTimeout(handleGameEnd, 3000); // Czytaj przez 3 sekundy
          };

          // Próba odtworzenia
          audio.play().catch(err => {
              console.warn("Autoplay blocked:", err);
              showTextAndSetState(); 
              setTimeout(handleGameEnd, 4000); 
          });

      } else {
          // Brak audio (fallback) - symulujemy czas czytania
          showTextAndSetState();
          const readTime = 1500 + (cleanText.length * 50); // 1.5s + czas na znaki
          setTimeout(handleGameEnd, Math.min(readTime, 5000)); // Max 5s
      }

    } catch (error) {
      console.error("Chat error:", error);
      setState(prev => ({ ...prev, isThinking: false, currentEmotion: "angry", messages: [...prev.messages, { id: Date.now().toString(), text: "☠️ (Błąd komunikacji)", isPlayer: false, timestamp: Date.now(), type: 'system' }] }));
    }
  };

  return {
    ...state,
    convictionLevel: state.displayPercent,
    gameStats: calculateStats(state.displayPercent, state.turnCount),
    sendMessage
  };
};