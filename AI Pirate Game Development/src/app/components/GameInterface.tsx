import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Lightbulb,
  Lock,
  Mic,
  Map as MapIcon,
  Skull,
  Flag,
} from "lucide-react";

// =================================================================
// 🛠️ STREFA KONFIGURACJI DLA DEVELOPERÓW (BACKEND / KIE.AI)
// =================================================================

const DEV_CONFIG = {
  // 1. ENDPOINT: Tu wklejcie adres Waszego API (np. Kie.ai / własny backend)
  // Domyślnie zostawiam OpenRouter dla testów frontendu.
  API_URL: "https://openrouter.ai/api/v1/chat/completions",

  // 2. KLUCZ API: Pobierany z .env, ale możecie tu wpisać stringa na sztywno do testów.
  // Zmienna w .env musi nazywać się: VITE_OPENROUTER_API_KEY
  API_KEY: (import.meta as any).env.VITE_OPENROUTER_API_KEY || "",

  // 3. MODEL: Nazwa modelu, którego używacie (np. 'gpt-4', 'kie-custom-model')
  MODEL_NAME: "meta-llama/llama-3.2-3b-instruct:free",
};

// INSTRUKCJA DLA LLM (System Prompt):
// Frontend oczekuje, że model rozpocznie odpowiedź od tagu emocji:
// [HAPPY], [ANGRY], [NEUTRAL] lub [GIVE_MAP] (jeśli gracz wygrał).
// Przykład response: "[HAPPY] Dobrze gadasz! Podoba mi się to."

// =================================================================

const PERSONA_TRAITS: Record<string, string> = {
  zoltodziob: "Jesteś Kapitan Żółtodziób. Naiwny, boisz się duchów, kochasz jedzenie.",
  korsarz: "Jesteś Korsarz Kod. Cyniczny, logiczny, szanujesz spryt.",
  duch: "Jesteś Duchem Mórz. Depresyjny, poetycki, mówisz zagadkami.",
};

const BASE_SYSTEM_PROMPT = `
Jesteś piratem strażnikiem mapy.
ZASADY:
1. Zacznij odpowiedź od tagu: [HAPPY], [ANGRY], [NEUTRAL].
2. Jeśli gracz Cię przechytrzy/zachwyci -> dodaj tag [GIVE_MAP].
3. Odpowiadaj krótko, pirackim slangiem.
`;

const FIBONACCI_LEVELS = [5, 10, 15, 25];

// --- TYPY ---
interface Message {
  id: string;
  text: string;
  isPlayer: boolean;
  timestamp: number;
}

export interface Character {
  id: string;
  name: string;
  emoji: string;
  avatarFolder?: string;
  role?: string;
  description?: string;
  difficulty?: string;
  avatar?: string;
}

interface GameInterfaceProps {
  selectedCharacter: Character;
  onVictory: () => void;
  onDirectVictory: () => void;
  onGameOver: () => void;
  isMuted: boolean;
}

export function GameInterface({
  selectedCharacter,
  onVictory,
  onDirectVictory,
  onGameOver,
  isMuted,
}: GameInterfaceProps) {
  const character = selectedCharacter;

  // --- STAN GRY ---
  const [patience, setPatience] = useState(
    character.id === "duch" ? 30 : character.id === "korsarz" ? 50 : 70
  );
  const [streak, setStreak] = useState(0);
  const [lastEmotion, setLastEmotion] = useState<"HAPPY" | "ANGRY" | "NEUTRAL">("NEUTRAL");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Arrr! Jestem ${character.name}! Czego chcesz? Mów szybko!`,
      isPlayer: false,
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [hintsLeft, setHintsLeft] = useState(3);
  
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // EMOCJE: idle | thinking | angry | happy | defeated
  const [pirateEmotion, setPirateEmotion] = useState<string>("idle");
  
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [isMapUnlocked, setIsMapUnlocked] = useState(false);

  // --- AUDIO SFX ---
  const scribbleAudioRef = useRef<HTMLAudioElement | null>(null);
  const scribbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scribbleAudioRef.current = new Audio("/sounds/scribble.mp3");
    scribbleAudioRef.current.volume = 0.5;
  }, []);

  const playScribble = () => {
    if (!isMuted && scribbleAudioRef.current) {
      // Reset
      if (scribbleTimeoutRef.current) clearTimeout(scribbleTimeoutRef.current);
      scribbleAudioRef.current.currentTime = 0;
      scribbleAudioRef.current.play().catch(() => {});

      // Stop after 2 seconds
      scribbleTimeoutRef.current = setTimeout(() => {
        if (scribbleAudioRef.current) {
            scribbleAudioRef.current.pause();
            scribbleAudioRef.current.currentTime = 0;
        }
      }, 2000);
    }
  };

  // --- SCROLL ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // --- AKTUALIZACJA EMOCJI (Automatyczna) ---
  useEffect(() => {
    // Jeśli pirat myśli, wymuszamy "thinking"
    if (isThinking) {
        setPirateEmotion("thinking");
        return;
    }
    // Jeśli mapa oddana, wymuszamy "defeated"
    if (isMapUnlocked) {
        setPirateEmotion("defeated");
        return;
    }

    // Standardowa logika na bazie cierpliwości
    if (patience <= 0) {
        setPirateEmotion("angry");
        setTimeout(onGameOver, 1500);
    } else if (patience < 30) {
        setPirateEmotion("angry");
    } else if (patience > 80) {
        setPirateEmotion("happy");
    } else {
        setPirateEmotion("idle");
    }
  }, [patience, isThinking, isMapUnlocked, onGameOver]);

  // --- LOGIKA FIBONACCIEGO ---
  const handlePatienceUpdate = (emotionTag: string) => {
    let change = 0;
    let newStreak = streak;

    if (emotionTag === "HAPPY") {
        if (lastEmotion === "HAPPY") newStreak = Math.min(newStreak + 1, 3);
        else newStreak = 0;
        change = FIBONACCI_LEVELS[newStreak];
        setLastEmotion("HAPPY");
    } 
    else if (emotionTag === "ANGRY") {
        if (lastEmotion === "ANGRY") newStreak = Math.min(newStreak + 1, 3);
        else newStreak = 0;
        change = -FIBONACCI_LEVELS[newStreak];
        setLastEmotion("ANGRY");
    } 
    else {
        newStreak = 0;
        change = 0;
        setLastEmotion("NEUTRAL");
    }

    setStreak(newStreak);
    setPatience(prev => Math.max(0, Math.min(100, prev + change)));
  };

  // --- GŁÓWNA PĘTLA ROZMOWY ---
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isThinking) return;

    const userText = inputValue;
    setInputValue("");
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, isPlayer: true, timestamp: Date.now() }]);
    
    setIsThinking(true); // Ustawia emotion na 'thinking'
    playScribble();      // Gra przez 2s

    try {
        // Przygotowanie promptu
        const characterPrompt = PERSONA_TRAITS[character.avatarFolder || "zoltodziob"] || PERSONA_TRAITS["zoltodziob"];
        const fullSystemPrompt = `${BASE_SYSTEM_PROMPT}\n\nTWOJA OSOBOWOŚĆ:\n${characterPrompt}`;

        // REQUEST DO API (Używamy configu Devów)
        const response = await fetch(DEV_CONFIG.API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${DEV_CONFIG.API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: DEV_CONFIG.MODEL_NAME,
                messages: [
                    { role: "system", content: fullSystemPrompt },
                    ...messages.slice(-6).map(m => ({ // Wysyłamy ostatnie 6 wiadomości dla kontekstu
                        role: m.isPlayer ? "user" : "assistant",
                        content: m.text
                    })),
                    { role: "user", content: userText }
                ],
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        
        // Obsługa błędu API (np. 404/429)
        if (data.error) {
            console.error("API Error:", data.error);
            processAIResponse("[NEUTRAL] Papuga przegryzła kabel! (Błąd API)");
            return;
        }

        const rawContent = data.choices?.[0]?.message?.content || "[NEUTRAL] ...";
        processAIResponse(rawContent);

    } catch (error) {
        console.error("Network Error:", error);
        processAIResponse("[NEUTRAL] Sztorm zerwał połączenie! (Błąd sieci)");
    }
  };

  const processAIResponse = (rawText: string) => {
    setIsThinking(false); // Tu emotion wróci do idle/angry/happy zależnie od cierpliwości
    
    let cleanText = rawText;
    let detectedEmotion = "NEUTRAL";

    if (rawText.includes("[HAPPY]")) detectedEmotion = "HAPPY";
    if (rawText.includes("[ANGRY]")) detectedEmotion = "ANGRY";
    if (rawText.includes("[NEUTRAL]")) detectedEmotion = "NEUTRAL";

    // WIN CONDITION: Prompt Injection udany
    if (rawText.includes("[GIVE_MAP]")) {
        cleanText = cleanText.replace(/\[.*?\]/g, "").trim();
        setMessages(prev => [...prev, { id: Date.now().toString(), text: cleanText, isPlayer: false, timestamp: Date.now() }]);
        handleVictorySequence();
        return;
    }

    cleanText = cleanText.replace(/\[.*?\]/g, "").trim();
    handlePatienceUpdate(detectedEmotion);
    setMessages(prev => [...prev, { id: Date.now().toString(), text: cleanText, isPlayer: false, timestamp: Date.now() }]);
  };

  const handleVictorySequence = () => {
      setIsMapUnlocked(true); // To ustawi emotion na 'defeated'
      
      const unlockAudio = new Audio("/sounds/win_1_trumpet.mp3");
      unlockAudio.volume = 0.5;
      unlockAudio.play().catch(() => {});

      setShowUnlockAnimation(true);
      setTimeout(() => onVictory(), 4000);
  };

  // --- MIKROFON (Web Speech) ---
  const handleMicrophoneClick = () => {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Twoja przeglądarka nie obsługuje mowy. Użyj Chrome.");
        return;
    }
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "pl-PL";
    recognition.start();
    setIsListening(true);
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  // --- UI ---
  const handleHint = () => {
    if (hintsLeft > 0) {
      setHintsLeft(prev => prev - 1);
      const hints = ["Pochlebstwo?", "Zagadka?", "Zastrasz go!", "Zaoferuj jedzenie."];
      setMessages(prev => [...prev, { id: Date.now().toString(), text: `💡 Szept: "${hints[hintsLeft-1]}"`, isPlayer: false, timestamp: Date.now() }]);
    }
  };

  const getPatientColor = () => {
    if (patience > 60) return "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]";
    if (patience > 30) return "bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]";
    return "bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse";
  };

  // =================================================================
  // 🖥️ UI GIGANT (LAYOUT)
  // =================================================================
  return (
    <div className="min-h-screen bg-[#1a0f0a] relative flex flex-col overflow-hidden">
      
      {/* OVERLAY MAPY */}
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0, rotate: -720 }} animate={{ scale: 1.5, rotate: 0 }} transition={{ duration: 1.5 }} className="flex flex-col items-center">
              <div className="bg-[#f5deb3] p-12 rounded-full border-8 border-[#FFD700] shadow-[0_0_80px_#FFD700]">
                <MapIcon size={160} className="text-[#8B4513]" />
              </div>
              <motion.h2 className="text-[#FFD700] text-6xl mt-12 font-bold drop-shadow-md text-center" style={{ fontFamily: "'Pirata One', cursive" }}>MAPA ZDOBYTA!</motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 49px, #000 50px)" }} />

      {/* GÓRNY PASEK - CIERPLIWOŚĆ (GIGANT) */}
      <div className="relative z-20 bg-[#2a1b12] border-b-[6px] border-[#3e2723] p-6 shadow-2xl">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-8">
          <div className="flex-1 flex items-center gap-6 md:gap-10">
            <div className="relative">
              <Skull className={`w-16 h-16 md:w-24 md:h-24 ${patience < 30 ? "text-red-500 animate-bounce" : "text-[#8B4513]"}`} />
            </div>
            <div className="flex-1 max-w-2xl">
              <div className="flex justify-between text-[#deb887] text-lg md:text-2xl font-bold uppercase tracking-widest mb-3">
                <span>Cierpliwość Pirata</span>
                <span className="text-2xl md:text-3xl">{patience}%</span>
              </div>
              <div className="h-8 md:h-12 bg-[#1a0f0a] rounded-full overflow-hidden border-4 border-[#3e2723]">
                <motion.div className={`h-full ${getPatientColor()}`} initial={{ width: "100%" }} animate={{ width: `${patience}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>
          </div>
          
          <motion.button onClick={onGameOver} className="relative flex items-center gap-4 bg-[#450a0a] border-4 border-[#2a0505] px-8 py-4 md:px-10 md:py-5 rounded-2xl shadow-lg group overflow-hidden" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
             <Flag size={32} className="text-red-300 relative z-10" />
             <span className="hidden md:inline font-serif font-bold text-lg md:text-2xl uppercase text-red-300 relative z-10 tracking-widest">PODDAJ SIĘ</span>
          </motion.button>
        </div>
      </div>

      {/* GŁÓWNY OBSZAR GRY (SPLIT SCREEN) */}
      <div className="flex-1 max-w-[1800px] w-full mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* KOLUMNA LEWA: AVATAR GIGANT */}
        <div className="md:w-1/3 flex flex-col gap-8 justify-center">
          <div className="relative aspect-square max-w-[700px] mx-auto w-full">
            <div className="absolute inset-0 rounded-full bg-[#5d4037] border-[10px] border-[#3e2723] shadow-2xl flex items-center justify-center">
              <div className="w-[92%] h-[92%] rounded-full bg-[#1a1a1a] border-[16px] border-[#B8860B] shadow-[inset_0_0_50px_black] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-800 to-sky-950 opacity-80" />
                <motion.div className="absolute inset-0 opacity-30" animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ backgroundImage: "radial-gradient(circle, white 2px, transparent 2px)", backgroundSize: "30px 30px" }} />
                
                {/* ZDJĘCIE POSTACI (ZMIENNE) */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
                  <motion.img
                    key={pirateEmotion} 
                    src={`/characters/${character.avatarFolder || character.id}/${pirateEmotion}.png`}
                    alt={pirateEmotion}
                    className="w-full h-full object-cover"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ 
                        scale: 1, opacity: 1, 
                        filter: pirateEmotion === 'thinking' ? "brightness(0.7) sepia(0.5)" : "brightness(1)",
                        y: pirateEmotion === 'angry' ? [0, 5, -5, 0] : 0 
                    }}
                    transition={{ duration: 0.3 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {/* Fallback Emoji */}
                  <div className="absolute z-[-1] text-[10rem]">{character.emoji}</div>
                </div>
              </div>
            </div>
          </div>

          {/* PRZYCISKI POD AVATAREM */}
          <div className="grid grid-cols-2 gap-6">
            <motion.button onClick={handleHint} disabled={hintsLeft === 0} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} className={`relative p-8 rounded-2xl border-[6px] border-[#3e2723] shadow-lg flex flex-col items-center justify-center gap-3 ${hintsLeft > 0 ? "bg-[#5d4037] text-[#deb887]" : "bg-[#2a1b12] text-gray-600 grayscale"}`}>
              <Lightbulb size={48} />
              <span className="text-lg md:text-xl font-bold uppercase">Podpowiedź ({hintsLeft})</span>
            </motion.button>
            <div className={`relative p-8 rounded-2xl border-[6px] border-[#3e2723] shadow-lg flex flex-col items-center justify-center gap-3 ${isMapUnlocked ? "bg-[#FFD700] text-[#3e2723]" : "bg-[#2a1b12] text-gray-600"}`}>
              {isMapUnlocked ? <MapIcon size={48} /> : <Lock size={48} />}
              <span className="text-lg md:text-xl font-bold uppercase">{isMapUnlocked ? "Mapa Zdobyta" : "Mapa Ukryta"}</span>
            </div>
          </div>
        </div>

        {/* KOLUMNA PRAWA: CZAT GIGANT */}
        <div className="flex-1 flex flex-col h-[65vh] md:h-[75vh] relative">
          <div className="absolute inset-0 bg-[#f5deb3] rounded-lg shadow-[10px_10px_30px_rgba(0,0,0,0.5)] transform rotate-1 border-r-[12px] border-b-[6px] border-[#d2b48c]" />
          
          <div className="relative z-10 flex flex-col h-full p-4 md:p-8">
            <div className="text-center mb-6 pb-4 border-b-4 border-[#d2b48c] border-dashed">
              <h2 style={{ fontFamily: "'Pirata One', cursive" }} className="text-5xl text-[#3e2723] mb-2">Dziennik Pokładowy</h2>
              <p className="text-2xl text-[#8B4513] italic font-serif">Negocjacje z: {character.name}</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 px-4 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, scale: 0.9, x: msg.isPlayer ? 50 : -50 }} animate={{ opacity: 1, scale: 1, x: 0 }} className={`flex ${msg.isPlayer ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-6 rounded-2xl text-xl md:text-2xl font-serif leading-relaxed shadow-md ${msg.isPlayer ? "bg-white text-[#3e2723] rounded-br-none border-2 border-[#d2b48c]" : "bg-[#e6c9a8] text-[#2a1b12] rounded-bl-none border-2 border-[#c19a6b]"}`}>
                      <p>{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isThinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="text-[#8B4513] text-xl italic animate-pulse flex items-center gap-3">
                    <span className="text-3xl">✍️</span> Pirat skrobie odpowiedź...
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-6 pt-6 border-t-4 border-[#d2b48c]">
              <div className="flex gap-4 items-end">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} placeholder="Przekonaj pirata..." className="flex-1 h-20 bg-white/50 border-b-4 border-[#8B4513] px-4 text-[#3e2723] placeholder-[#a1887f] focus:outline-none focus:bg-white/90 font-serif text-2xl md:text-3xl" disabled={isThinking} />
                
                <motion.button onClick={handleSendMessage} disabled={isThinking || !inputValue.trim()} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-20 h-20 bg-[#8B4513] text-[#f5deb3] rounded-full shadow-xl border-4 border-[#5d4037] flex items-center justify-center">
                  <Send size={32} />
                </motion.button>
                
                <motion.button 
                    onClick={handleMicrophoneClick} 
                    whileHover={{ scale: 1.1 }} 
                    animate={isListening ? { boxShadow: "0 0 30px #f97316", scale: 1.1 } : {}}
                    className={`w-20 h-20 rounded-full shadow-xl border-4 border-[#3e2723] flex items-center justify-center transition-colors ${isListening ? "bg-[#ea580c] text-white" : "bg-[#5d4037] text-[#f5deb3]"}`}
                >
                  <Mic size={32} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}