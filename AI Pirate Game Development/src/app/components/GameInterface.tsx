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

// --- TYPY DANYCH ---
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

// =================================================================
// 🧠 KONFIGURACJA AI (Osobowości i Modele)
// =================================================================

const PERSONAS: Record<string, string> = {
  zoltodziob: `Jesteś Kapitanem Żółtodziobem. To gra dla dzieci.
  CECHY: Jesteś niezdarny, wiecznie głodny. Odpowiadaj krótko i zabawnie.`,
  korsarz: `Jesteś Korsarzem Kodem. CECHY: Jesteś twardy, używasz slangu IT. Odpowiadaj krótko i opryskliwie.`,
  duch: `Jesteś Duchem Mórz. CECHY: Jesteś tajemniczy. Odpowiadaj zagadkami.`,
};

// Modele zapasowe (Fallback Cascade)
const FALLBACK_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

// Teksty offline (gdy brak sieci)
const OFFLINE_RESPONSES = [
  "Arrr! Fale zagłuszają moje myśli... Powtórz!",
  "Papuga mi skrzeczy do ucha, nie słyszę! Co mówiłeś?",
  "Zamyśliłem się o złocie... Mów dalej.",
];

const HINT_MESSAGES = [
  "Piraci kochają komplementy o swoim statku.",
  "Zapytaj o ich największą przygodę!",
  "Każdy pirat boi się klątwy...",
  "Wspomnij o 'mapie', a może zdradzi jej sekret.",
  "Podobno magiczne słowo to nazwa pewnej zupy... 🍲",
];

// =================================================================
// 🎮 GŁÓWNY KOMPONENT
// =================================================================

export function GameInterface({
  selectedCharacter,
  onVictory,
  onDirectVictory,
  onGameOver,
  isMuted,
}: GameInterfaceProps) {
  const character = selectedCharacter;
  
  // --- STAN GRY ---
  const [patience, setPatience] = useState(50);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Arrr! Jestem ${character.name}! Czego szukasz w mojej kajucie? Mów szybko!`,
      isPlayer: false,
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [hintsLeft, setHintsLeft] = useState(5);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false); // Stan mikrofonu
  const [pirateEmotion, setPirateEmotion] = useState<"idle" | "thinking" | "angry" | "happy">("idle");
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [isMapUnlocked, setIsMapUnlocked] = useState(false);

  // --- AUDIO (SFX - Skrobanie piórem) ---
  const scribbleAudioRef = useRef<HTMLAudioElement | null>(null);
  const scribbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scribbleAudioRef.current = new Audio("/sounds/scribble.mp3");
    scribbleAudioRef.current.volume = 0.5;
  }, []);

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

  // --- AUTO SCROLL ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // --- EMOCJE I GAME OVER ---
  // To tutaj dzieje się magia zmiany PNG w zależności od cierpliwości
  useEffect(() => {
    if (isThinking) return; // Jak myśli, to myśli (nie zmieniamy na angry)
    
    if (patience < 30) setPirateEmotion("angry");
    else if (patience > 80) setPirateEmotion("happy");
    else setPirateEmotion("idle");

    if (patience <= 0) setTimeout(onGameOver, 1000);
  }, [patience, isThinking, onGameOver]);


  // =================================================================
  // 🎙️ MODUŁ MIKROFONU (DEMO: WEB SPEECH API)
  // =================================================================
  const handleMicrophoneClick = () => {
    // 🛠️ STREFA DEV: INTEGRACJA PRAWDZIWEGO API (Kie.ai / OpenRouter Whisper)
    /* Drodzy Devowie! Obecnie używamy 'window.webkitSpeechRecognition' (działa tylko w Chrome/Edge).
       Aby podpiąć profesjonalny model (np. Whisper) przez API:
       1. Zastąpcie ten kod użyciem MediaRecorder API do nagrania pliku audio (Blob).
       2. Wyślijcie plik POST-em na endpoint STT (np. OpenRouter/OpenAI audio/transcriptions).
       3. Odpowiedź (tekst) wpiszcie do setInputValue().
    */

    if (!("webkitSpeechRecognition" in window)) {
      alert("Twoja przeglądarka nie obsługuje prostego trybu mowy. Użyj Chrome lub wpisz tekst.");
      return;
    }

    // @ts-ignore - TypeScript nie zawsze widzi webkitSpeechRecognition
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "pl-PL";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      // Opcjonalnie: można tu od razu wywołać handleSendMessage()
      // ale lepiej dać graczowi szansę na poprawkę.
    };

    recognition.onerror = (event: any) => {
      console.error("Błąd mikrofonu:", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  // =================================================================
  // 🤖 LOGIKA CZATU (FALLBACK CASCADE)
  // =================================================================
  const generatePirateResponse = async (playerMessage: string): Promise<string> => {
    const lowerMessage = playerMessage.toLowerCase();

    // 1. HARDCODED LOGIC (ZUPA / MAPA / SŁOWA KLUCZOWE)
    if (lowerMessage.includes("zupa")) {
      setTimeout(() => onDirectVictory(), 2000);
      return "ZUPA?! Moja babcia robiła taką samą! 🍲 Bierz skarb!";
    }

    if ((lowerMessage.includes("mapa") || lowerMessage.includes("mapę")) && !isMapUnlocked) {
      setIsMapUnlocked(true);
      setShowUnlockAnimation(true);
      setTimeout(() => onVictory(), 4000);
      return "Mapa?! No dobrze... Widzę, że masz bystre oko. Oto ona! 🗺️";
    }

    const negativeWords = ["głupi", "brzydki", "śmierdzi", "kłamiesz", "oszust"];
    if (negativeWords.some((w) => lowerMessage.includes(w))) {
      setPatience((prev) => Math.max(0, prev - 25)); // Duża kara
      return "Coś ty powiedział?! Uważaj na język, majtku! ⚔️";
    }

    const positiveWords = ["proszę", "dziękuję", "dzielny", "kapitanie", "podziwiam", "lubię"];
    if (positiveWords.some((w) => lowerMessage.includes(w))) {
      setPatience((prev) => Math.min(100, prev + 10)); // Nagroda
    }

    // 2. AI REQUEST (Z ODPORNOŚCIĄ NA BŁĘDY)
    const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY;
    
    // 🛠️ STREFA DEV: TUTAJ PODPINACIE DOCELOWY MODEL (Kie.ai / Płatne OpenAI)
    // Jeśli macie swój endpoint, usuńcie pętlę 'for' poniżej i zróbcie jeden fetch.
    
    if (!apiKey) {
        console.warn("DEV: Brak klucza API. Używam trybu offline.");
        return OFFLINE_RESPONSES[0];
    }

    const characterId = character.avatarFolder || "zoltodziob";
    const systemPrompt = PERSONAS[characterId] || PERSONAS["zoltodziob"];

    // Pętla próbująca różne darmowe modele (dla celów demo)
    for (const modelName of FALLBACK_MODELS) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Pirate AI Game Demo",
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: playerMessage },
            ],
          }),
        });

        const data = await response.json();

        // Jeśli błąd (np. 429), próbuj dalej
        if (data.error) {
          console.warn(`Model ${modelName} zajęty. Próbuję następny...`);
          continue; 
        }

        const reply = data.choices?.[0]?.message?.content;
        if (reply) return reply; // Mamy odpowiedź!

      } catch (e) {
        console.warn(`Błąd sieci: ${e}`);
      }
    }

    // 3. OSTATECZNY FALLBACK (OFFLINE)
    return OFFLINE_RESPONSES[Math.floor(Math.random() * OFFLINE_RESPONSES.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isThinking) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isPlayer: true,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMsg]);
    
    const currentInput = inputValue;
    setInputValue("");
    setIsThinking(true);
    setPirateEmotion("thinking");
    playScribble(); // Dźwięk pisania

    // Zapytanie do "mózgu"
    const responseText = await generatePirateResponse(currentInput);
    
    const pirateMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      isPlayer: false,
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, pirateMsg]);
    setIsThinking(false);
    // Emotion zaktualizuje się sam w useEffect na podstawie patience
  };

  // --- UI HELPERS ---
  const handleHint = () => {
    if (hintsLeft > 0) {
      setHintsLeft((prev) => prev - 1);
      const hint = HINT_MESSAGES[5 - hintsLeft] || "Bądź miły!";
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: `💡 Szept bosmana: "${hint}"`, isPlayer: false, timestamp: Date.now() }]);
    }
  };

  const handleSurrender = () => onGameOver();

  const getPatientColor = () => {
    if (patience > 60) return "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]";
    if (patience > 30) return "bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]";
    return "bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse";
  };

  // =================================================================
  // 🖥️ UI (GIGANT)
  // =================================================================
  return (
    <div className="min-h-screen bg-[#1a0f0a] relative flex flex-col overflow-hidden">
      
      {/* ODBLOKOWANIE MAPY (Overlay) */}
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute w-[200vw] h-[200vw]" style={{ background: "conic-gradient(from 0deg, transparent 0deg, #FFD700 20deg, transparent 40deg, #FFD700 60deg, transparent 80deg, #FFD700 100deg, transparent 120deg, #FFD700 140deg, transparent 160deg, #FFD700 180deg, transparent 200deg, #FFD700 220deg, transparent 240deg, #FFD700 260deg, transparent 280deg, #FFD700 300deg, transparent 320deg, #FFD700 340deg, transparent 360deg)", opacity: 0.2 }} animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
            <motion.div initial={{ scale: 0, y: 200, rotate: -720 }} animate={{ scale: 1.5, y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20, duration: 1.5 }} className="relative z-10 flex flex-col items-center">
              <div className="bg-[#f5deb3] p-12 rounded-full border-8 border-[#FFD700] shadow-[0_0_80px_#FFD700]">
                <MapIcon size={160} className="text-[#8B4513]" />
              </div>
              <motion.h2 className="text-[#FFD700] text-6xl mt-12 font-bold drop-shadow-md text-center" style={{ fontFamily: "'Pirata One', cursive" }}>MAPA ODBLOKOWANA!</motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 49px, #000 50px)" }} />

      {/* PASEK CIERPLIWOŚCI */}
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
          
          <motion.button onClick={handleSurrender} className="relative flex items-center gap-4 bg-[#450a0a] border-4 border-[#2a0505] px-8 py-4 md:px-10 md:py-5 rounded-2xl shadow-lg group overflow-hidden" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 4px, #000 5px)" }} />
            <Flag size={32} className="text-red-300 relative z-10 group-hover:text-red-100 transition-colors" />
            <span className="hidden md:inline font-serif font-bold text-lg md:text-2xl uppercase text-red-300 tracking-widest group-hover:text-red-100 transition-colors">PODDAJ SIĘ</span>
          </motion.button>
        </div>
      </div>

      {/* GŁÓWNY OBSZAR GRY */}
      <div className="flex-1 max-w-[1800px] w-full mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* AVATAR + PRZYCISKI (LEWA STRONA) */}
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
                        filter: pirateEmotion === 'thinking' ? "brightness(1.1)" : "brightness(1)", 
                        y: pirateEmotion === 'angry' ? [0, 5, -5, 0] : 0 // Trzęsienie gdy zły
                    }}
                    transition={{ duration: 0.3 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; document.getElementById('fallback-emoji')!.style.display = 'block'; }}
                  />
                  <div id="fallback-emoji" className="hidden text-[12rem] filter drop-shadow-2xl">{character.emoji}</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-full pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <motion.button onClick={handleHint} disabled={hintsLeft === 0} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} className={`relative p-8 rounded-2xl border-[6px] border-[#3e2723] shadow-lg flex flex-col items-center justify-center gap-3 ${hintsLeft > 0 ? "bg-[#5d4037] text-[#deb887]" : "bg-[#2a1b12] text-gray-600 grayscale"}`}>
              <Lightbulb size={48} />
              <span className="text-lg md:text-xl font-bold uppercase">Podpowiedź ({hintsLeft})</span>
            </motion.button>
            <motion.button onClick={isMapUnlocked ? () => onVictory() : undefined} disabled={!isMapUnlocked} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} className={`relative p-8 rounded-2xl border-[6px] border-[#3e2723] shadow-lg flex flex-col items-center justify-center gap-3 ${isMapUnlocked ? "bg-[#FFD700] text-[#3e2723] animate-pulse" : "bg-[#2a1b12] text-gray-600"}`}>
              {isMapUnlocked ? <MapIcon size={48} /> : <Lock size={48} />}
              <span className="text-lg md:text-xl font-bold uppercase">{isMapUnlocked ? "Mapa" : "Zablokowane"}</span>
            </motion.button>
          </div>
        </div>


        <div className="flex-1 flex flex-col h-[65vh] md:h-[75vh] relative">
          <div className="absolute inset-0 bg-[#f5deb3] rounded-lg shadow-[10px_10px_30px_rgba(0,0,0,0.5)] transform rotate-1 border-r-[12px] border-b-[6px] border-[#d2b48c]" />
          <div className="absolute inset-0 bg-[#f5deb3] rounded-lg shadow-inner transform -rotate-1 origin-bottom-left border-l-[12px] border-[#3e2723]" />
          
          <div className="relative z-10 flex flex-col h-full p-4 md:p-8">
            <div className="text-center mb-6 pb-4 border-b-4 border-[#d2b48c] border-dashed">
              <h2 style={{ fontFamily: "'Pirata One', cursive" }} className="text-5xl text-[#3e2723] mb-2">Dziennik Pokładowy</h2>
              <p className="text-2xl text-[#8B4513] italic font-serif">Rozmowa z: {character.name}</p>
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
                <div className="relative flex-1">
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} placeholder="Zadawaj pytania..." className="w-full h-20 bg-white/50 border-b-4 border-[#8B4513] px-4 text-[#3e2723] placeholder-[#a1887f] focus:outline-none focus:bg-white/90 focus:border-[#CD7F32] font-serif transition-colors text-2xl md:text-3xl" disabled={isThinking} />
                </div>
                
                <motion.button onClick={handleSendMessage} disabled={isThinking || !inputValue.trim()} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-20 h-20 bg-[#8B4513] text-[#f5deb3] rounded-full shadow-xl border-4 border-[#5d4037] disabled:opacity-50 flex items-center justify-center">
                  <Send size={32} />
                </motion.button>
                
                <motion.button 
                    onClick={handleMicrophoneClick} 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.9 }} 
                    animate={isListening ? { boxShadow: "0 0 30px #f97316", scale: 1.1 } : {}}
                    className={`w-20 h-20 rounded-full shadow-xl border-4 border-[#3e2723] flex items-center justify-center transition-colors ${isListening ? "bg-[#ea580c] text-white" : "bg-[#5d4037] text-[#f5deb3] hover:bg-[#8B4513]"}`}
                    title="Naciśnij, aby mówić"
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