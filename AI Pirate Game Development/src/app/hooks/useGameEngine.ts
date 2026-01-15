import { useState, useEffect } from 'react';
import { Message, Character } from '../../core/types';
import { gameService } from '../../services/game.service'; 

// Nowy interfejs dla statystyk "skoków narciarskich"
export interface GameStats {
  technique: number; // 0-100 (wynik merytoryczny)
  style: number;     // 0-20 (bonus za szybkość)
  total: number;     // Suma
  grade: string;     // Słowna ocena (np. "Legenda")
}

interface GameState {
  messages: Message[];
  isThinking: boolean;
  convictionLevel: number; // Surowy wynik (-100 do 100)
  displayPercent: number;  // Wynik % (0 do 100)
  isGameOver: boolean;
  isWon: boolean;
  gameId: string | null;
  currentEmotion: string;
  turnCount: number;
}

// Zmiana typu onVictory, aby przyjmował statystyki
export const useGameEngine = (character: Character, onVictory?: (stats: GameStats) => void) => {
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

  // --- LOGIKA RANKINGU (SKOKI NARCIARSKIE) ---
  const calculateStats = (percent: number, turns: number): GameStats => {
    // 1. Technika: Po prostu wynik % (0-100)
    const technique = percent;

    // 2. Styl: Max 20 pkt. Odejmujemy punkty za każdą turę powyżej 3.
    // Im szybciej wygrasz, tym więcej punktów za styl.
    let style = 20 - Math.max(0, (turns - 3) * 2); 
    if (style < 0) style = 0;

    // 3. Suma
    const total = technique + style;

    // 4. Ocena słowna
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
    
    let cleanText = rawText
        .replace(/\[.*?\]/g, "") 
        .replace(/\(.*?\)/g, "")
        .replace(/\*.*?\*/g, "")
        .trim();

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
        
        if (mounted) {
          setState(prev => ({ 
            ...prev, gameId: data.game_id, 
            convictionLevel: 0, displayPercent: 50, isThinking: false 
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

  const sendMessage = async (userText: string) => {
    if (!state.gameId || state.isGameOver) return;

    const userMsg: Message = { 
        id: Date.now().toString(), text: userText, isPlayer: true, timestamp: Date.now(), type: 'text' 
    };

    setState(prev => ({
      ...prev, messages: [...prev.messages, userMsg], isThinking: true, currentEmotion: "thinking", 
      turnCount: prev.turnCount + 1
    }));

    try {
      const response = await gameService.sendMessage(userText);
      const { emotion, cleanText } = sanitizeResponse(response.pirate_response);

      const pirateMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: cleanText, 
        isPlayer: false, timestamp: Date.now(), type: 'text' 
      };

      const AUDIO_DELAY_MS = 1200;

      setTimeout(() => {
        setState(prev => {
            const rawScore = response.merit_score; 
            const percentScore = mapScoreToPercent(rawScore);
            const currentTurn = prev.turnCount;

            const isSafePeriod = currentTurn < 2;
            const validWin = response.is_won && rawScore > 40 && !isSafePeriod;
            const validLoss = !validWin && rawScore <= -90 && !isSafePeriod;

            // Obliczamy statystyki
            const stats = calculateStats(percentScore, currentTurn);

            // Przekazujemy statystyki do onVictory
            if (validWin && onVictory) setTimeout(() => onVictory(stats), 2500);

            if (response.audio_url) {
                const audio = new Audio(response.audio_url);
                audio.play().catch(e => console.warn("Autoplay audio blocked", e));
            }

            return {
                ...prev,
                messages: [...prev.messages, pirateMsg],
                convictionLevel: rawScore,
                displayPercent: percentScore,
                isWon: validWin,
                isGameOver: validWin || validLoss,
                isThinking: false,
                currentEmotion: validWin ? "happy" : (validLoss ? "angry" : emotion)
            };
        });
      }, AUDIO_DELAY_MS);

    } catch (error) {
      console.error("Chat error:", error);
      setState(prev => ({ 
        ...prev, isThinking: false, currentEmotion: "angry",
        messages: [...prev.messages, { id: Date.now().toString(), text: "☠️ (Papuga zjadła kabel)", isPlayer: false, timestamp: Date.now(), type: 'system' }] 
      }));
    }
  };

  // Obliczamy statystyki na bieżąco
  const gameStats = calculateStats(state.displayPercent, state.turnCount);

  return {
    messages: state.messages,
    isThinking: state.isThinking,
    convictionLevel: state.displayPercent,
    rawScore: state.convictionLevel,
    isGameOver: state.isGameOver,
    isWon: state.isWon,
    currentEmotion: state.currentEmotion,
    gameStats, 
    sendMessage
  };
};