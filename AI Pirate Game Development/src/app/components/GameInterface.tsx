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
  Volume2
} from "lucide-react";

// =================================================================
// 🛠️ STREFA KONFIGURACJI (LOCALHOST VERSION)
// =================================================================

const DEV_CONFIG = {
  // 1. LLM ENDPOINT (Twój lokalny backend, np. Python/Node)
  // Oczekuje POST z body: { message: "tekst gracza", context: "historia..." }
  // Zwraca JSON: { text: "[HAPPY] Treść odpowiedzi..." }
  LOCAL_LLM_URL: "http://localhost:3000/api/chat",

  // 2. TTS ENDPOINT (Twój lokalny generator głosu)
  // Oczekuje POST z body: { text: "Treść do powiedzenia" }
  // Zwraca: PLIK AUDIO (Blob/Stream)
  LOCAL_TTS_URL: "http://localhost:3000/api/tts",
};

// =================================================================

const PERSONA_TRAITS: Record<string, string> = {
  zoltodziob: "Jesteś Kapitan Żółtodziób. Naiwny, boisz się duchów, kochasz jedzenie.",
  korsarz: "Jesteś Korsarz Kod. Cyniczny, logiczny, szanujesz spryt.",
  duch: "Jesteś Duchem Mórz. Depresyjny, poetycki, mówisz zagadkami.",
};

const FIBONACCI_LEVELS = [5, 10, 15, 25];

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
  
  const [pirateEmotion, setPirateEmotion] = useState<string>("idle");
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [isMapUnlocked, setIsMapUnlocked] = useState(false);

  // --- AUDIO SFX & TTS ---
  const scribbleAudioRef = useRef<HTMLAudioElement | null>(null);
  const scribbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null); // Do głosu pirata

  useEffect(() => {
    scribbleAudioRef.current = new Audio("/sounds/scribble.mp3");
    scribbleAudioRef.current.volume = 0.5;
    ttsAudioRef.current = new Audio(); // Inicjalizacja pustego audio dla TTS
  }, []);

  // Funkcja odtwarzająca głos z backendu
  const playPirateVoice = async (text: string) => {
    if (isMuted) return;

    try {
      const response = await fetch(DEV_CONFIG.LOCAL_TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text, character: character.id }),
      });

      if (!response.ok) throw new Error("TTS Error");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (ttsAudioRef.current) {
        ttsAudioRef.current.src = audioUrl;
        ttsAudioRef.current.play().catch(e => console.warn("TTS Play error", e));
      }
    } catch (e) {
      console.warn("Brak backendu TTS lub błąd połączenia. Pirat milczy.");
    }
  };

  const playScribble = () => {
    if (!isMuted && scribbleAudioRef.current) {
      if (scribbleTimeoutRef.current) clearTimeout(scribbleTimeoutRef.current);
      scribbleAudioRef.current.currentTime = 0;
      scribbleAudioRef.current.play().catch(() => {});
      scribbleTimeoutRef.current = setTimeout(() => {
        if (scribbleAudioRef.current) {
            scribbleAudioRef.current.pause();
            scribbleAudioRef.current.currentTime = 0;
        }
      }, 2000);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    if (isThinking) { setPirateEmotion("thinking"); return; }
    if (isMapUnlocked) { setPirateEmotion("defeated"); return; }
    if (patience <= 0) { setPirateEmotion("angry"); setTimeout(onGameOver, 1500); }
    else if (patience < 30) setPirateEmotion("angry");
    else if (patience > 80) setPirateEmotion("happy");
    else setPirateEmotion("idle");
  }, [patience, isThinking, isMapUnlocked, onGameOver]);

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

  // --- 1. LOCAL LLM LOGIC ---
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isThinking) return;

    const userText = inputValue;
    setInputValue("");
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, isPlayer: true, timestamp: Date.now() }]);
    
    setIsThinking(true);
    playScribble();

    try {
        // Wysyłamy do LOCALHOST
        const response = await fetch(DEV_CONFIG.LOCAL_LLM_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                character: character.id, // Backend musi wiedzieć kogo symuluje
                systemPrompt: PERSONA_TRAITS[character.avatarFolder || "zoltodziob"],
                history: messages.slice(-6), // Kontekst
                message: userText
            }),
        });

        const data = await response.json();
        
        // Backend powinien zwrócić czysty tekst odpowiedzi (może już zawierać tagi)
        const rawContent = data.text || data.content || "[NEUTRAL] ...";
        processAIResponse(rawContent);

    } catch (error) {
        console.error("Local Backend Error:", error);
        // Fallback dla demo (jeśli backend nie jest odpalony)
        setTimeout(() => {
           processAIResponse("[NEUTRAL] (Błąd połączenia z Localhost:3000. Sprawdź czy backend działa.)");
        }, 1000);
    }
  };

  const processAIResponse = (rawText: string) => {
    setIsThinking(false);
    
    let cleanText = rawText;
    let detectedEmotion = "NEUTRAL";

    if (rawText.includes("[HAPPY]")) detectedEmotion = "HAPPY";
    if (rawText.includes("[ANGRY]")) detectedEmotion = "ANGRY";
    if (rawText.includes("[NEUTRAL]")) detectedEmotion = "NEUTRAL";

    if (rawText.includes("[GIVE_MAP]")) {
        cleanText = cleanText.replace(/\[.*?\]/g, "").trim();
        setMessages(prev => [...prev, { id: Date.now().toString(), text: cleanText, isPlayer: false, timestamp: Date.now() }]);
        playPirateVoice(cleanText); // Głos zwycięstwa
        handleVictorySequence();
        return;
    }

    cleanText = cleanText.replace(/\[.*?\]/g, "").trim();
    
    // Logika gry
    handlePatienceUpdate(detectedEmotion);
    setMessages(prev => [...prev, { id: Date.now().toString(), text: cleanText, isPlayer: false, timestamp: Date.now() }]);
    
    // Odtwórz głos (TTS)
    playPirateVoice(cleanText);
  };

  const handleVictorySequence = () => {
      setIsMapUnlocked(true);
      const unlockAudio = new Audio("/sounds/win_1_trumpet.mp3");
      unlockAudio.volume = 0.5;
      unlockAudio.play().catch(() => {});
      setShowUnlockAnimation(true);
      setTimeout(() => onVictory(), 4000);
  };

  // --- 2. LOCAL STT (BROWSER NATIVE) ---
  const handleMicrophoneClick = () => {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Twoja przeglądarka nie obsługuje mowy (Użyj Chrome/Edge).");
        return;
    }
    
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "pl-PL"; 
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
    };

    recognition.start();
  };

  // --- UI HELPERS ---
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
  // 🖥️ UI RENDER
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

      {/* PASEK GÓRNY */}
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

      {/* OBSZAR GRY */}
      <div className="flex-1 max-w-[1800px] w-full mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* AVATAR (LEWA) */}
        <div className="md:w-1/3 flex flex-col gap-8 justify-center">
          <div className="relative aspect-square max-w-[700px] mx-auto w-full">
            <div className="absolute inset-0 rounded-full bg-[#5d4037] border-[10px] border-[#3e2723] shadow-2xl flex items-center justify-center">
              <div className="w-[92%] h-[92%] rounded-full bg-[#1a1a1a] border-[16px] border-[#B8860B] shadow-[inset_0_0_50px_black] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-800 to-sky-950 opacity-80" />
                <motion.div className="absolute inset-0 opacity-30" animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ backgroundImage: "radial-gradient(circle, white 2px, transparent 2px)", backgroundSize: "30px 30px" }} />
                
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
                  <div className="absolute z-[-1] text-[10rem]">{character.emoji}</div>
                </div>
              </div>
            </div>
          </div>

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

        {/* CZAT (PRAWA) */}
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
                    <span className="text-3xl">🤔</span> Pirat myśli...
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-6 pt-6 border-t-4 border-[#d2b48c]">
              <div className="flex gap-4 items-end">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} placeholder="Przekonaj pirata..." className="flex-1 h-20 bg-white/50 border-b-4 border-[#8B4513] px-4 text-[#3e2723] placeholder-[#a1887f] focus:outline-none focus:bg-white/90 font-serif text-2xl md:text-3xl" disabled={isThinking || isListening} />
                
                <motion.button onClick={handleSendMessage} disabled={isThinking || !inputValue.trim()} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-20 h-20 bg-[#8B4513] text-[#f5deb3] rounded-full shadow-xl border-4 border-[#5d4037] flex items-center justify-center">
                  <Send size={32} />
                </motion.button>
                
                {/* MIKROFON (Localhost STT) */}
                <motion.button 
                    onClick={handleMicrophoneClick} 
                    whileHover={{ scale: 1.1 }} 
                    animate={isListening ? { boxShadow: "0 0 30px #f97316", scale: 1.1 } : {}}
                    className={`w-20 h-20 rounded-full shadow-xl border-4 border-[#3e2723] flex items-center justify-center transition-colors ${isListening ? "bg-[#ea580c] text-white" : "bg-[#5d4037] text-[#f5deb3]"}`}
                    title="Naciśnij, aby mówić (Localhost)"
                >
                  <Mic size={32} />
                </motion.button>

                {/* GŁOŚNIK (Ikona TTS status) */}
                 <div className="w-10 h-20 flex items-center justify-center opacity-50" title="Głos pirata (z backendu)">
                     <Volume2 size={24} className="text-[#8B4513]" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}