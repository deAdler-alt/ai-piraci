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

import { useGameEngine } from "../hooks/useGameEngine";
import { Character } from "../../core/types";

interface GameInterfaceProps {
  selectedCharacter: Character;
  onVictory: () => void;
  onGameOver: () => void;
}

export function GameInterface({
  selectedCharacter,
  onVictory,
  onGameOver,
}: GameInterfaceProps) {
  
  const engine = useGameEngine(selectedCharacter, onVictory, onGameOver);
  const [inputValue, setInputValue] = useState("");
  const [hintsLeft, setHintsLeft] = useState(3);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [engine.messages, engine.isThinking]);

  const handleSendClick = () => {
    if (inputValue.trim()) {
      engine.sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleHintClick = () => {
    if (hintsLeft > 0) {
      setHintsLeft(prev => prev - 1);
      const hints = [
        "Zastrasz go klątwą!", 
        "Zaoferuj podział zysków!", 
        "Powołaj się na jego matkę!", 
        "Obiecaj mu jedzenie!",
        "Użyj podstępu!"
      ];
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      engine.addHintMessage(`SUGESTIA: ${randomHint}`);
    }
  };

  const handleMicrophoneClick = () => {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Twoja przeglądarka nie obsługuje mowy (Użyj Chrome/Edge).");
        return;
    }
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "pl-PL"; 
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
    };
    recognition.start();
  };

  const getProgressColor = () => {
    if (engine.patience > 80) return "bg-green-500 shadow-[0_0_20px_#22c55e]";
    if (engine.patience > 40) return "bg-yellow-500 shadow-[0_0_15px_#eab308]";
    return "bg-red-600 shadow-[0_0_15px_#dc2626]";
  };

  const avatarVariants = {
    idle: { y: [0, 5, 0], transition: { repeat: Infinity, duration: 4 } },
    thinking: { scale: [1, 1.02, 1], filter: "brightness(0.8)", transition: { repeat: Infinity, duration: 1 } },
    happy: { y: [0, -15, 0], scale: 1.1, filter: "brightness(1.2)", transition: { type: "spring", stiffness: 300 } },
    angry: { x: [-5, 5, -5, 5, 0], filter: "hue-rotate(-20deg) contrast(1.2)", transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-[#1a0f0a] relative flex flex-col overflow-hidden">
      
      {/* OVERLAY MAPY */}
      <AnimatePresence>
        {engine.isMapUnlocked && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
              <div className="bg-[#FFD700] p-12 rounded-full shadow-[0_0_100px_#FFD700] animate-pulse">
                <MapIcon size={120} className="text-[#3e2723]" />
              </div>
              <h2 className="text-[#FFD700] text-6xl mt-8 font-bold text-center" style={{ fontFamily: "'Pirata One', cursive" }}>SKARB JEST TWÓJ!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 49px, #000 50px)" }} />

      {/* --- GÓRNY PASEK --- */}
      <div className="relative z-20 bg-[#2a1b12] border-b-[6px] border-[#3e2723] p-6 shadow-2xl">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-8">
          <div className="flex-1 flex items-center gap-6 md:gap-10">
            <div className="relative">
              <Skull className={`w-16 h-16 md:w-24 md:h-24 ${engine.patience < 30 ? "text-red-500 animate-bounce" : "text-[#8B4513]"}`} />
            </div>
            <div className="flex-1 max-w-2xl">
              <div className="flex justify-between text-[#deb887] mb-3">
                {/* ZMIANA FONTU NA TEN Z "PODDAJ SIĘ" */}
                <span className="font-serif font-bold text-lg md:text-2xl uppercase tracking-widest">POZIOM PRZEKONANIA</span>
                <span className="font-serif font-bold text-2xl md:text-3xl">{Math.round(engine.patience)}%</span>
              </div>
              <div className="h-8 md:h-12 bg-[#1a0f0a] rounded-full overflow-hidden border-4 border-[#3e2723]">
                <motion.div className={`h-full ${getProgressColor()}`} initial={{ width: "50%" }} animate={{ width: `${engine.patience}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>
          </div>
          
          <motion.button onClick={onGameOver} className="relative flex items-center gap-4 bg-[#450a0a] border-4 border-[#2a0505] px-8 py-4 md:px-10 md:py-5 rounded-2xl shadow-lg group overflow-hidden" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
             <Flag size={32} className="text-red-300 relative z-10" />
             <span className="hidden md:inline font-serif font-bold text-lg md:text-2xl uppercase text-red-300 relative z-10 tracking-widest">PODDAJ SIĘ</span>
          </motion.button>
        </div>
      </div>

      {/* --- GŁÓWNY OBSZAR --- */}
      <div className="flex-1 max-w-[1800px] w-full mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* LEWA: AVATAR W BULAJU */}
        <div className="md:w-1/3 flex flex-col gap-8 justify-center items-center">
          
          <div className="relative aspect-square max-w-[500px] w-full">
            <div className="absolute inset-0 rounded-full bg-[#3e2723] shadow-2xl flex items-center justify-center overflow-hidden border-[4px] border-[#2d1b15]">
                {/* Śruby */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                    <div key={deg} className="absolute w-4 h-4 bg-[#1a0f0a] rounded-full shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1)]" style={{ top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-230px)` }} />
                ))}

                {/* Złota ramka */}
                <div className="w-[92%] h-[92%] rounded-full border-[16px] border-[#B8860B] bg-[#1a1a1a] relative overflow-hidden shadow-[inset_0_0_50px_black]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#1e293b] opacity-80" />
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                    
                    <motion.div 
                        className="w-full h-full relative flex items-center justify-center"
                        animate={engine.pirateEmotion as any}
                        variants={avatarVariants as any}
                    >
                        {/* 🔍 TUTAJ ZMIENIASZ ROZMIAR AVATARA */}
                        {/* Zmieniono na w-full h-full, żeby wypełnił całą ramkę. 
                            Jeśli chcesz mniejszy, zmień na w-[90%] h-[90%] */}
                        <img
                            src={`/characters/${selectedCharacter.avatarFolder || selectedCharacter.id}/${engine.pirateEmotion}.png`}
                            alt="Pirate"
                            className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                        />
                    </motion.div>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full">
            <motion.button onClick={handleHintClick} disabled={hintsLeft === 0} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} className={`relative p-8 rounded-2xl border-[6px] border-[#3e2723] shadow-lg flex flex-col items-center justify-center gap-3 ${hintsLeft > 0 ? "bg-[#5d4037] text-[#deb887]" : "bg-[#2a1b12] text-gray-600 grayscale"}`}>
              <Lightbulb size={48} />
              {/* ZMIANA FONTU */}
              <span className="font-serif font-bold text-lg md:text-xl uppercase tracking-widest">Podpowiedź ({hintsLeft})</span>
            </motion.button>
            <div className={`relative p-8 rounded-2xl border-[6px] border-[#3e2723] shadow-lg flex flex-col items-center justify-center gap-3 ${engine.isMapUnlocked ? "bg-[#FFD700] text-[#3e2723]" : "bg-[#2a1b12] text-gray-600"}`}>
              {engine.isMapUnlocked ? <MapIcon size={48} /> : <Lock size={48} />}
              {/* ZMIANA FONTU */}
              <span className="font-serif font-bold text-lg md:text-xl uppercase tracking-widest">{engine.isMapUnlocked ? "Skarb Twój" : "Skarb Ukryty"}</span>
            </div>
          </div>
        </div>

        {/* PRAWA: CZAT */}
        <div className="flex-1 flex flex-col h-[65vh] md:h-[75vh] relative">
          <div className="absolute inset-0 bg-[#f5deb3] rounded-lg shadow-[10px_10px_30px_rgba(0,0,0,0.5)] transform rotate-1 border-r-[12px] border-b-[6px] border-[#d2b48c]" />
          
          <div className="relative z-10 flex flex-col h-full p-4 md:p-8">
            <div className="text-center mb-6 pb-4 border-b-4 border-[#d2b48c] border-dashed">
              <h2 style={{ fontFamily: "'Pirata One', cursive" }} className="text-5xl text-[#3e2723] mb-2">Dziennik Pokładowy</h2>
              <p className="text-2xl text-[#8B4513] italic font-serif">Negocjacje z: {selectedCharacter.name}</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 px-4 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {engine.messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, scale: 0.9, x: msg.type === 'system' ? 0 : (msg.isPlayer ? 50 : -50) }} animate={{ opacity: 1, scale: 1, x: 0 }} className={`flex ${msg.type === 'system' ? "justify-center" : (msg.isPlayer ? "justify-end" : "justify-start")}`}>
                    
                    {msg.type === 'system' ? (
                       <div className="my-2 max-w-[90%] transform -rotate-1">
                          <div className="bg-[#fffbeb] border-[3px] border-[#fbbf24] text-[#92400e] px-8 py-5 rounded-2xl text-xl shadow-lg flex items-start gap-4">
                              <Lightbulb size={32} className="text-[#f59e0b] mt-1 shrink-0" />
                              {/* ZMIANA FONTU: Usunięto italic, dodano font-serif, żeby pasowało do reszty czatu */}
                              <p className="font-serif leading-relaxed">{msg.text}</p>
                          </div>
                      </div>
                    ) : (
                      <div className={`max-w-[85%] p-6 rounded-2xl text-xl md:text-2xl font-serif leading-relaxed shadow-md ${msg.isPlayer ? "bg-white text-[#3e2723] rounded-br-none border-2 border-[#d2b48c]" : "bg-[#e6c9a8] text-[#2a1b12] rounded-bl-none border-2 border-[#c19a6b]"}`}>
                        <p>{msg.text}</p>
                      </div>
                    )}

                  </motion.div>
                ))}
              </AnimatePresence>
              
              {engine.isThinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="text-[#8B4513] text-xl italic animate-pulse flex items-center gap-3 ml-4">
                    <span className="text-3xl"></span> Pirat analizuje ofertę...
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-6 pt-6 border-t-4 border-[#d2b48c]">
              <div className="flex gap-4 items-end">
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    onKeyPress={(e) => e.key === "Enter" && handleSendClick()} 
                    placeholder="Przekonaj pirata..." 
                    className="flex-1 h-20 bg-white/50 border-b-4 border-[#8B4513] px-4 text-[#3e2723] placeholder-[#a1887f] focus:outline-none focus:bg-white/90 font-serif text-2xl md:text-3xl" 
                    disabled={engine.isThinking || isListening} 
                />
                
                <motion.button onClick={handleSendClick} disabled={engine.isThinking || !inputValue.trim()} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-20 h-20 bg-[#8B4513] text-[#f5deb3] rounded-full shadow-xl border-4 border-[#5d4037] flex items-center justify-center">
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