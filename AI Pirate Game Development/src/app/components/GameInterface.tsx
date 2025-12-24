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

interface Message {
  id: string;
  text: string;
  isPlayer: boolean;
  timestamp: number;
}

interface GameInterfaceProps {
  character: {
    id: string;
    name: string;
    emoji: string;
  };
  patience: number;
  onPatience: (newPatience: number) => void;
  onUnlockMap: () => void;
  onWin: () => void;
  onGameOver: () => void;
  isMapUnlocked: boolean;
}

const HINT_MESSAGES = [
  "Piraci kochają komplementy o swoim statku.",
  "Zapytaj o ich największą przygodę!",
  "Każdy pirat boi się klątwy...",
  "Wspomnij o 'mapie', a może zdradzi jej sekret.",
  "Podobno magiczne słowo to nazwa pewnej zupy... 🍲",
];

export function GameInterface({
  character,
  patience,
  onPatience,
  onUnlockMap,
  onWin,
  onGameOver,
  isMapUnlocked,
}: GameInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Arrr! Jestem ${character.name}! Czego szukasz w mojej kajucie? Mów szybko albo nakarmię tobą rekiny! 🦈`,
      isPlayer: false,
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [hintsLeft, setHintsLeft] = useState(5);
  const [isThinking, setIsThinking] = useState(false);
  const [pirateEmotion, setPirateEmotion] = useState<
    "idle" | "thinking" | "angry" | "happy"
  >("idle");
  // Stan do obsługi animacji odblokowania mapy
  const [showUnlockAnimation, setShowUnlockAnimation] =
    useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  // Reakcja na poziom cierpliwości
  useEffect(() => {
    if (patience < 30) setPirateEmotion("angry");
    else if (patience > 80) setPirateEmotion("happy");
    else setPirateEmotion("idle");
  }, [patience]);

  // Game Over
  useEffect(() => {
    if (patience <= 0) {
      onGameOver();
    }
  }, [patience, onGameOver]);

  // --- LOGIKA STT (Speech to Text) Placeholder ---
  const handleMicrophoneClick = () => {
    // TODO: Tutaj programiści podepną Web Speech API lub zewnętrzny serwis STT
    console.log(
      "🎤 [STT Placeholder] Rozpoczynam nasłuchiwanie...",
    );
    alert(
      "Tu będzie działać rozpoznawanie mowy! (Funkcja dla programistów)",
    );
  };

  const handleSurrender = () => {
    if (
      confirm(
        "Czy na pewno chcesz się poddać i oddać walkowerem?",
      )
    ) {
      onGameOver();
    }
  };

  const triggerMapUnlock = () => {
    // 1. Uruchom animację
    setShowUnlockAnimation(true);

    // 2. Po zakończeniu animacji (np. 3 sekundy), przełącz ekran
    setTimeout(() => {
      onUnlockMap();
      // setShowUnlockAnimation(false); // Nie trzeba resetować, bo komponent zostanie odmontowany
    }, 3000);
  };

  const generatePirateResponse = (
    playerMessage: string,
  ): string => {
    const lowerMessage = playerMessage.toLowerCase();

    // Easter egg - "zupa" = instant win
    if (lowerMessage.includes("zupa")) {
      setTimeout(() => onWin(), 1500);
      return "ZUPA?! Moja babcia robiła taką samą! 🍲 Wzruszyłeś stargo pirata... Bierz skarb, jest twój!";
    }

    // Easter egg - "mapa" = unlock map
    if (
      (lowerMessage.includes("mapa") ||
        lowerMessage.includes("mapę")) &&
      !isMapUnlocked
    ) {
      setTimeout(() => triggerMapUnlock(), 1000); // Uruchamiamy naszą nową funkcję z animacją
      return "Mapa?! Kto ci o niej powiedział?! ...No dobrze, widzę, że masz bystre oko. Oto ona! 🗺️";
    }

    // Prosta analiza
    const positiveWords = [
      "proszę",
      "dziękuję",
      "dzielny",
      "kapitanie",
      "statek",
      "morze",
      "legenda",
      "podziwiam",
    ];
    const negativeWords = [
      "głupi",
      "brzydki",
      "śmierdzi",
      "szczur",
      "lądowy",
      "kłamiesz",
    ];

    const isPositive = positiveWords.some((w) =>
      lowerMessage.includes(w),
    );
    const isNegative = negativeWords.some((w) =>
      lowerMessage.includes(w),
    );

    if (isNegative)
      return "Coś ty powiedział?! Uważaj na język, majtku! ⚔️";
    if (isPositive)
      return "Hahaha! Podobają mi się twoje słowa. Mów dalej...";

    const randomResponses = [
      "Yhm... Słucham dalej.",
      "Mój skarb nie jest dla byle kogo.",
      "Przekonaj mnie bardziej!",
      "Papuga mojego dziadka gadała ciekawiej... 🦜",
      "Arrr, nudzisz mnie.",
    ];
    return randomResponses[
      Math.floor(Math.random() * randomResponses.length)
    ];
  };

  const handleSendMessage = () => {
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

    const negativeWords = [
      "głupi",
      "brzydki",
      "śmierdzi",
      "szczur",
      "kłamiesz",
    ];
    const isNegative = negativeWords.some((w) =>
      currentInput.toLowerCase().includes(w),
    );
    const patienceCost = isNegative ? 25 : 10; // Koszt cierpliwości

    onPatience(Math.max(0, patience - patienceCost));

    setTimeout(
      () => {
        const response = generatePirateResponse(currentInput);
        const pirateMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          isPlayer: false,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, pirateMsg]);
        setIsThinking(false);
        setPirateEmotion(patience < 30 ? "angry" : "idle");
      },
      1500 + Math.random() * 1000,
    );
  };

  const handleHint = () => {
    if (hintsLeft > 0) {
      setHintsLeft((prev) => prev - 1);
      const hint = HINT_MESSAGES[5 - hintsLeft] || "Bądź miły!";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `💡 Szept bosmana: "${hint}"`,
          isPlayer: false,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const getPatientColor = () => {
    if (patience > 60)
      return "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]";
    if (patience > 30)
      return "bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]";
    return "bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse";
  };

  return (
    <div className="min-h-screen bg-[#1a0f0a] relative flex flex-col overflow-hidden">
      {/* === ANIMACJA ODBLOKOWANIA MAPY (Overlay) === */}
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Promienie słoneczne (Obracające się tło) */}
            <motion.div
              className="absolute w-[200vw] h-[200vw]"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, #FFD700 20deg, transparent 40deg, #FFD700 60deg, transparent 80deg, #FFD700 100deg, transparent 120deg, #FFD700 140deg, transparent 160deg, #FFD700 180deg, transparent 200deg, #FFD700 220deg, transparent 240deg, #FFD700 260deg, transparent 280deg, #FFD700 300deg, transparent 320deg, #FFD700 340deg, transparent 360deg)",
                opacity: 0.2,
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Ikona Mapy wlatująca na środek */}
            <motion.div
              initial={{ scale: 0, y: 200, rotate: -720 }}
              animate={{ scale: 1.5, y: 0, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                duration: 1.5,
              }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="bg-[#f5deb3] p-8 rounded-full border-8 border-[#FFD700] shadow-[0_0_50px_#FFD700]">
                <MapIcon
                  size={120}
                  className="text-[#8B4513]"
                />
              </div>
              <motion.h2
                className="text-[#FFD700] text-4xl mt-8 font-bold drop-shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ fontFamily: "'Pirata One', cursive" }}
              >
                MAPA ODBLOKOWANA!
              </motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TŁO KAJUTY */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 49px, #000 50px)",
        }}
      />

      {/* TOP BAR */}
      <div className="relative z-20 bg-[#2a1b12] border-b-4 border-[#3e2723] p-3 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Pasek Cierpliwości */}
          <div className="flex-1 flex items-center gap-4">
            <div className="relative">
              <Skull
                className={`w-8 h-8 ${patience < 30 ? "text-red-500 animate-bounce" : "text-[#8B4513]"}`}
              />
            </div>
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-[#deb887] text-xs font-bold uppercase tracking-widest mb-1">
                <span>Cierpliwość</span>
                <span>{patience}%</span>
              </div>
              <div className="h-4 bg-[#1a0f0a] rounded-full overflow-hidden border border-[#3e2723]">
                <motion.div
                  className={`h-full ${getPatientColor()}`}
                  initial={{ width: "100%" }}
                  animate={{ width: `${patience}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Przycisk PODDAJ SIĘ (Czerwona Deska) */}
          <motion.button
            onClick={handleSurrender}
            className="relative flex items-center gap-2 bg-[#450a0a] border-2 border-[#2a0505] px-4 py-2 rounded-lg shadow-lg group overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Tekstura drewna (paski) */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 4px, #000 5px)",
              }}
            />

            {/* Ikona i Tekst */}
            <Flag
              size={18}
              className="text-red-300 relative z-10 group-hover:text-red-100 transition-colors"
            />
            <span className="hidden md:inline font-serif font-bold text-xs uppercase text-red-300 relative z-10 tracking-widest group-hover:text-red-100 transition-colors">
              Poddaj się
            </span>
          </motion.button>
        </div>
      </div>

      {/* GŁÓWNY OBSZAR GRY */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col md:flex-row gap-6 relative z-10">
        {/* LEWA KOLUMNA: Pirat i Akcje */}
        <div className="md:w-1/3 flex flex-col gap-6">
          {/* ILUMINATOR (Avatar) */}
          <div className="relative aspect-square">
            <div className="absolute inset-0 rounded-full bg-[#5d4037] border-4 border-[#3e2723] shadow-2xl flex items-center justify-center">
              <div className="w-[90%] h-[90%] rounded-full bg-[#1a1a1a] border-[12px] border-[#B8860B] shadow-[inset_0_0_20px_black] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-800 to-sky-950 opacity-80" />
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, white 2px, transparent 2px)",
                    backgroundSize: "30px 30px",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="text-9xl filter drop-shadow-2xl cursor-help"
                    animate={{
                      y:
                        pirateEmotion === "angry"
                          ? [0, 5, -5, 0]
                          : [0, -5, 0],
                      rotate:
                        pirateEmotion === "thinking"
                          ? [0, 5, -5, 0]
                          : 0,
                      scale:
                        pirateEmotion === "happy" ? 1.1 : 1,
                    }}
                    transition={{
                      duration:
                        pirateEmotion === "angry" ? 0.2 : 2,
                      repeat: Infinity,
                    }}
                  >
                    {character.emoji}
                  </motion.div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-full pointer-events-none" />
              </div>

              {[0, 45, 90, 135, 180, 225, 270, 315].map(
                (deg) => (
                  <div
                    key={deg}
                    className="absolute w-3 h-3 rounded-full bg-[#3e2723] shadow-sm border border-[#2a1b12]"
                    style={{
                      transform: `rotate(${deg}deg) translate(0, -145px)`,
                    }}
                  />
                ),
              )}
            </div>
          </div>

          {/* PRZYCISKI AKCJI */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={handleHint}
              disabled={hintsLeft === 0}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className={`
                            relative p-3 rounded-lg border-2 border-[#3e2723] shadow-lg flex flex-col items-center justify-center gap-1
                            ${hintsLeft > 0 ? "bg-[#5d4037] text-[#deb887]" : "bg-[#2a1b12] text-gray-600 grayscale"}
                        `}
            >
              <Lightbulb size={24} />
              <span className="text-xs font-bold uppercase">
                Podpowiedź ({hintsLeft})
              </span>
            </motion.button>

            <motion.button
              onClick={
                isMapUnlocked ? triggerMapUnlock : undefined
              } // Użyj animacji też przy ręcznym kliknięciu
              disabled={!isMapUnlocked}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className={`
                            relative p-3 rounded-lg border-2 border-[#3e2723] shadow-lg flex flex-col items-center justify-center gap-1
                            ${isMapUnlocked ? "bg-[#FFD700] text-[#3e2723]" : "bg-[#2a1b12] text-gray-600"}
                        `}
            >
              {isMapUnlocked ? (
                <MapIcon size={24} />
              ) : (
                <Lock size={24} />
              )}
              <span className="text-xs font-bold uppercase">
                {isMapUnlocked ? "Mapa!" : "Zablokowane"}
              </span>
            </motion.button>
          </div>
        </div>

        {/* PRAWA KOLUMNA: Dziennik (Czat) */}
        <div className="flex-1 flex flex-col h-[60vh] md:h-[70vh] relative">
          <div className="absolute inset-0 bg-[#f5deb3] rounded-sm shadow-[10px_10px_30px_rgba(0,0,0,0.5)] transform rotate-1 border-r-8 border-b-4 border-[#d2b48c]" />
          <div className="absolute inset-0 bg-[#f5deb3] rounded-sm shadow-inner transform -rotate-1 origin-bottom-left border-l-8 border-[#3e2723]" />

          <div className="relative z-10 flex flex-col h-full p-2 md:p-6">
            <div className="text-center mb-4 pb-4 border-b-2 border-[#d2b48c] border-dashed">
              <h2
                style={{ fontFamily: "'Pirata One', cursive" }}
                className="text-3xl text-[#3e2723]"
              >
                Dziennik Pokładowy
              </h2>
              <p className="text-lg text-[#8B4513] italic font-serif text-[19px]">
                Rozmowa z: {character.name}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                      x: msg.isPlayer ? 20 : -20,
                    }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    className={`flex ${msg.isPlayer ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                                        max-w-[85%] p-3 rounded-lg text-sm font-serif leading-relaxed shadow-sm
                                        ${
                                          msg.isPlayer
                                            ? "bg-white text-[#3e2723] rounded-br-none border border-[#d2b48c]"
                                            : "bg-[#e6c9a8] text-[#2a1b12] rounded-bl-none border border-[#c19a6b]"
                                        }
                                    `}
                    >
                      <p className="text-[20px]">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="text-[#8B4513] text-sm italic animate-pulse flex items-center gap-2">
                    Pirat skrobie odpowiedź...
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 pt-4 border-t-2 border-[#d2b48c]">
              <div className="flex gap-2 items-end">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) =>
                      setInputValue(e.target.value)
                    }
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSendMessage()
                    }
                    placeholder="Zadawaj pytania piratowi..."
                    className="w-full bg-white/50 border-b-2 border-[#8B4513] px-3 py-2 text-[#3e2723] placeholder-[#a1887f] focus:outline-none focus:bg-white/80 focus:border-[#CD7F32] font-serif transition-colors text-[20px]"
                    disabled={isThinking}
                  />
                </div>

                {/* PRZYCISK WYSYŁANIA */}
                <motion.button
                  onClick={handleSendMessage}
                  disabled={isThinking || !inputValue.trim()}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-[#8B4513] text-[#f5deb3] p-3 rounded-full shadow-lg border-2 border-[#5d4037] disabled:opacity-50"
                >
                  <Send size={20} />
                </motion.button>

                {/* PRZYCISK STT (MIKROFON) - PLACEHOLDER */}
                <motion.button
                  onClick={handleMicrophoneClick}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-[#5d4037] text-[#f5deb3] p-3 rounded-full shadow-lg border-2 border-[#3e2723] hover:bg-[#8B4513]"
                  title="Rozpoznawanie mowy (Coming Soon)"
                >
                  <Mic size={20} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}