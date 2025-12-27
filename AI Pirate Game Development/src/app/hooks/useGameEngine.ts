import { useState, useRef, useEffect } from "react";
import { Character, Message } from "../../core/types";
import { FIBONACCI_LEVELS } from "../../core/constants";
import { sendMessageToLLM } from "../../services/llm.service";
import { fetchPirateVoice } from "../../services/tts.service";

export const useGameEngine = (character: Character, onVictory: () => void, onGameOver: () => void) => {
  // Startujemy od razu z 50%
  const [patience, setPatience] = useState(50);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Arrr! Jestem ${character.name}! Czego chcesz? Mam mało czasu!`,
      isPlayer: false,
      timestamp: Date.now(),
      type: "text"
    },
  ]);
  
  const [streak, setStreak] = useState(0);
  const [lastEmotion, setLastEmotion] = useState<string>("NEUTRAL");
  const [isThinking, setIsThinking] = useState(false);
  const [pirateEmotion, setPirateEmotion] = useState<string>("idle");
  const [isMapUnlocked, setIsMapUnlocked] = useState(false);

  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    ttsAudioRef.current = new Audio();
  }, []);

  // --- REAKCJE AVATARA (DYNAMIKA) ---
  // Aktualizujemy emocje natychmiast po zmianie paska
  useEffect(() => {
    if (isThinking) {
        setPirateEmotion("thinking");
        return;
    }
    if (patience >= 100 || isMapUnlocked) {
        setPirateEmotion("happy"); // Wygrana = Happy
        return;
    }
    if (patience <= 0) {
        setPirateEmotion("angry");
        setTimeout(onGameOver, 1500);
        return;
    }
    
    // Dynamiczna zmiana w trakcie gry
    if (lastEmotion === "HAPPY") setPirateEmotion("happy");
    else if (lastEmotion === "ANGRY") setPirateEmotion("angry");
    else setPirateEmotion("idle");

  }, [patience, isThinking, isMapUnlocked, lastEmotion]);


  const updatePatience = (emotionTag: string) => {
    let change = 0;
    let newStreak = streak;
    
    // Zapamiętujemy ostatnią emocję dla avatara
    setLastEmotion(emotionTag);

    if (emotionTag === "HAPPY") {
      if (lastEmotion === "HAPPY") newStreak = Math.min(newStreak + 1, 3);
      else newStreak = 0;
      change = FIBONACCI_LEVELS[newStreak];
    } else if (emotionTag === "ANGRY") {
      if (lastEmotion === "ANGRY") newStreak = Math.min(newStreak + 1, 3);
      else newStreak = 0;
      change = -FIBONACCI_LEVELS[newStreak];
    } else {
      newStreak = 0;
      change = 0;
    }

    setStreak(newStreak);
    setPatience((prev) => Math.max(0, Math.min(100, prev + change)));
  };

  const playVoice = async (text: string) => {
    // SFX GRAJĄ ZAWSZE (niezależnie od muzyki w tle)
    try {
        const audioUrl = await fetchPirateVoice(text, character.id);
        if (audioUrl && ttsAudioRef.current) {
            ttsAudioRef.current.src = audioUrl;
            ttsAudioRef.current.volume = 1.0; // Głos na 100%
            ttsAudioRef.current.play().catch(() => {});
        }
    } catch (e) { console.error(e); }
  };

  // --- PODPOWIEDŹ JAKO WIADOMOŚĆ ---
  const addHintMessage = (hintText: string) => {
     setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: hintText,
        isPlayer: false,
        timestamp: Date.now(),
        type: "system" // Specjalny typ
     }]);
  };

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || isThinking) return;

    setMessages((prev) => [...prev, { 
      id: Date.now().toString(), text: userText, isPlayer: true, timestamp: Date.now(), type: "text" 
    }]);
    setIsThinking(true);

    // Dźwięk pisania (Zawsze słyszalny)
    setTimeout(() => {
        const scribble = new Audio("/sounds/scribble.mp3");
        scribble.volume = 0.5;
        scribble.play().catch(() => {});
    }, 500); // Mniejsze opóźnienie dla dynamiki

    const rawResponse = await sendMessageToLLM(character.id, messages, userText);
    
    setIsThinking(false);
    let cleanText = rawResponse;
    let detectedEmotion = "NEUTRAL";

    if (rawResponse.includes("[HAPPY]")) detectedEmotion = "HAPPY";
    if (rawResponse.includes("[ANGRY]")) detectedEmotion = "ANGRY";
    
    // SZYBKA WYGRANA
    if (rawResponse.includes("[GIVE_MAP]")) {
      cleanText = cleanText.replace(/\[.*?\]/g, "").trim();
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: cleanText, isPlayer: false, timestamp: Date.now(), type: "text" }]);
      setIsMapUnlocked(true);
      playVoice(cleanText);
      setTimeout(onVictory, 3000); // Szybsze przejście do ekranu wygranej
      return;
    }

    cleanText = cleanText.replace(/\[.*?\]/g, "").trim();
    updatePatience(detectedEmotion);
    setMessages((prev) => [...prev, { id: Date.now().toString(), text: cleanText, isPlayer: false, timestamp: Date.now(), type: "text" }]);
    playVoice(cleanText);
  };

  return {
    messages,
    patience,
    isThinking,
    pirateEmotion,
    isMapUnlocked,
    sendMessage,
    addHintMessage 
  };
};