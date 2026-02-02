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

  // --- STATYSTYKI ---
  const calculateStats = (percent: number, turns: number): GameStats => {
    const technique = percent;
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

      // 3. Pobranie twardych danych z backendu
      const isWin = response.is_won;   
      const isLoss = response.is_lost; 
      const rawScore = response.merit_score;
      const percentScore = mapScoreToPercent(rawScore);
      
      const stats = calculateStats(percentScore, state.turnCount + 1);

      // Funkcja pomocnicza: Wyświetlenie tekstu pirata
      const showTextAndSetState = () => {
        setState(prev => ({
            ...prev,
            messages: [...prev.messages, pirateMsg], 
            convictionLevel: rawScore,
            displayPercent: percentScore,
            // WAŻNE: Tu wstrzymujemy zmianę flag isWon/isGameOver!
            // Dzięki temu UI się nie przełączy, dopóki pirat nie skończy mówić.
            isWon: false, 
            isGameOver: false, 
            isThinking: false, 
            currentEmotion: isWin ? "happy" : (isLoss ? "angry" : emotion)
        }));
      };

      // Funkcja pomocnicza: FAKTYCZNY Koniec gry (zmiana ekranu)
      const handleGameEnd = () => {
        // Dopiero tutaj decydujemy o zmianie ekranu
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

          audio.onplay = () => {
              showTextAndSetState(); // Pokaż tekst, ale nie kończ gry
          };

          // Kluczowy moment: Czekamy na koniec audio!
          audio.onended = () => {
              handleGameEnd(); // TERAZ kończymy grę
          };

          audio.onerror = () => {
              console.warn("Audio error, fallback to text.");
              showTextAndSetState();
              // Jeśli błąd audio, dajemy czas na przeczytanie przed wyrzuceniem ekranu
              setTimeout(handleGameEnd, 3000);
          };

          audio.play().catch(err => {
              console.warn("Autoplay blocked:", err);
              showTextAndSetState();
              setTimeout(handleGameEnd, 4000);
          });

      } else {
          // Brak audio (fallback)
          showTextAndSetState();
          const readTime = 1500 + (cleanText.length * 50);
          // Czekamy obliczony czas zanim wyrzucimy ekran końca gry
          setTimeout(handleGameEnd, Math.min(readTime, 5000));
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