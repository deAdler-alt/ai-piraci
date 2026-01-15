import { useState, useEffect } from 'react';
import { Message, Character } from '../../core/types';
import { gameService } from '../../services/game.service'; 

interface GameState {
  messages: Message[];
  isThinking: boolean;
  convictionLevel: number; // To jest surowy wynik z backendu (-100 do 100)
  displayPercent: number;  // To jest wynik przeliczony na % dla paska (0 do 100)
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
    convictionLevel: 0,   // Startujemy od 0 (neutralnie w nowej skali -100..100)
    displayPercent: 50,   // Wizualnie to środek paska
    isGameOver: false,
    isWon: false,
    gameId: null,
    currentEmotion: "idle",
    turnCount: 0
  });

  // --- POMOCNICZE: Mapowanie skali -100..100 na 0..100% ---
  const mapScoreToPercent = (backendScore: number) => {
    // Zabezpieczenie zakresu
    const clamped = Math.max(-100, Math.min(100, backendScore));
    // Przeliczenie: -100 -> 0, 0 -> 50, 100 -> 100
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

  // 1. START GRY
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
            convictionLevel: 0, 
            displayPercent: 50,
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

      // --- AUDIO SYNC: Opóźniamy aktualizację stanu o 1s (lub więcej), 
      // żeby tekst nie pojawił się przed dźwiękiem ---
      // W idealnym świecie backend zwróciłby "audio duration" lub streamował,
      // ale przy prostym setupie opóźnienie "na sztywno" to dobry hack.
      
      const AUDIO_DELAY_MS = 1200; // 1.2 sekundy opóźnienia tekstu

      setTimeout(() => {
        setState(prev => {
            const rawScore = response.merit_score; // Skala -100 do 100
            const percentScore = mapScoreToPercent(rawScore);
            const currentTurn = prev.turnCount;

            // Okres ochronny (2 tury)
            const isSafePeriod = currentTurn < 2;

            // Warunki wygranej
            // Zakładamy, że wygrana w nowej skali to np. > 60 (czyli 80% na pasku)
            const validWin = response.is_won && rawScore > 40 && !isSafePeriod;
            const validLoss = !validWin && rawScore <= -90 && !isSafePeriod; // Przegrana przy -90

            if (validWin && onVictory) setTimeout(onVictory, 2500); // Dłuższy czas na przeczytanie

            // Odtwórz audio (jeśli backend zwraca URL)
            if (response.audio_url) {
                const audio = new Audio(response.audio_url);
                audio.play().catch(e => console.warn("Autoplay audio blocked", e));
            }

            return {
            ...prev,
            messages: [...prev.messages, pirateMsg],
            convictionLevel: rawScore,
            displayPercent: percentScore, // Używamy przeliczonego %
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

  return {
    messages: state.messages,
    isThinking: state.isThinking,
    // Zwracamy displayPercent jako convictionLevel dla UI, żeby nie psuć komponentów wizualnych
    convictionLevel: state.displayPercent, 
    rawScore: state.convictionLevel, // Dostęp do surowego wyniku jakby był potrzebny
    isGameOver: state.isGameOver,
    isWon: state.isWon,
    currentEmotion: state.currentEmotion,
    sendMessage
  };
};