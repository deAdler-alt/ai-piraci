import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCcw } from "lucide-react";

interface VictoryProps {
  onRestart: () => void;
  isMuted: boolean;
}

export function Victory({ onRestart, isMuted }: VictoryProps) {
  const [isChestOpen, setIsChestOpen] = useState(false);

  // 1. TRĄBKA NA WEJŚCIE
  useEffect(() => {
    if (!isMuted) {
      const trumpet = new Audio("/sounds/win_1_trumpet.mp3");
      trumpet.volume = 1.0;
      trumpet.play().catch((e) => console.log("Audio error:", e));
    }
  }, [isMuted]);

  // 2. OBSŁUGA OTWARCIA SKRZYNI
  const handleChestClick = () => {
    if (isChestOpen) return;
    setIsChestOpen(true);

    if (!isMuted) {
      const chestAudio = new Audio("/sounds/win_3_chest_open.mp3");
      chestAudio.volume = 1.0;
      chestAudio.play().catch((e) => console.log(e));

      setTimeout(() => {
        const coinsAudio = new Audio("/sounds/win_2_coins.mp3");
        coinsAudio.volume = 0.8;
        coinsAudio.play().catch((e) => console.log(e));
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#050302] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* TŁO: JASKINIA SKARBÓW */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
               radial-gradient(circle at 50% 60%, rgba(255, 215, 0, 0.15) 0%, rgba(0,0,0,1) 80%),
               repeating-linear-gradient(45deg, #1a120b 0px, #0f0906 20px)
             `,
        }}
      />

      {/* "GOD RAYS" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] z-0 opacity-30 pointer-events-none">
        <motion.div
          className="w-full h-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, #FFD700 15deg, transparent 30deg, #FFD700 45deg, transparent 60deg, #FFD700 75deg, transparent 90deg, #FFD700 105deg, transparent 120deg, #FFD700 135deg, transparent 150deg, #FFD700 165deg, transparent 180deg, #FFD700 195deg, transparent 210deg, #FFD700 225deg, transparent 240deg, #FFD700 255deg, transparent 270deg, #FFD700 285deg, transparent 300deg, #FFD700 315deg, transparent 330deg, #FFD700 345deg, transparent 360deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* DESZCZ MONET */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl md:text-6xl z-0"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -100,
            rotate: 0,
            opacity: 0,
          }}
          animate={{
            y: window.innerHeight + 100,
            rotate: 360,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        >
          {["🪙", "👑", "💎", "🏆"][Math.floor(Math.random() * 4)]}
        </motion.div>
      ))}

      {/* --- GŁÓWNA ZAWARTOŚĆ --- */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
        
        {/* TYTUŁ - DUŻY, ALE NIE TITANIC */}
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-10 md:mb-16"
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "clamp(3.5rem, 8vw, 6rem)", // Wyważony rozmiar
            color: "#FFD700",
            textShadow: "0 0 25px rgba(255, 215, 0, 0.5), 4px 4px 0px #3e2723",
            lineHeight: 1,
            letterSpacing: "3px"
          }}
        >
          ZWYCIĘSTWO!
        </motion.h1>

        {/* SKRZYNIA SKARBÓW - STOSOWNY GIGANT */}
        <div
          className="relative w-64 h-64 md:w-96 md:h-96 mb-12 cursor-pointer group"
          onClick={handleChestClick}
        >
          {/* Blask pod skrzynią */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-10 bg-black/60 blur-2xl rounded-full" />

          {/* ZAWARTOSC SKRZYNI */}
          <AnimatePresence>
            {isChestOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 80 }}
                animate={{ opacity: 1, scale: 1.3, y: -80 }}
                className="absolute bottom-1/2 left-0 right-0 flex justify-center items-end z-0 pointer-events-none"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 blur-[60px] opacity-70" />
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0], y: [-5, 5, -5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-[10rem] relative z-10 filter drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                  >
                    👑
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DÓŁ SKRZYNI */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-32 md:h-48 bg-gradient-to-b from-[#8d6e63] to-[#3e2723] rounded-b-[2.5rem] border-[6px] border-[#2a1b12] shadow-2xl z-10 flex items-center justify-center overflow-hidden"
            animate={isChestOpen ? {} : { rotate: [0, -2, 2, 0] }}
            transition={{ duration: 0.5, repeat: isChestOpen ? 0 : Infinity, repeatDelay: 3 }}
          >
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 19px, #000 20px)" }} />
            <div className="absolute left-6 top-0 bottom-0 w-5 bg-[#FFD700] border-x-2 border-[#b8860b] shadow-inner" />
            <div className="absolute right-6 top-0 bottom-0 w-5 bg-[#FFD700] border-x-2 border-[#b8860b] shadow-inner" />
          </motion.div>

          {/* WIECKO SKRZYNI */}
          <motion.div
            className="absolute bottom-28 md:bottom-44 left-[-12px] right-[-12px] h-24 md:h-36 bg-gradient-to-b from-[#a1887f] to-[#5d4037] rounded-t-full border-[6px] border-[#2a1b12] shadow-lg z-20 flex items-end justify-center"
            initial={{ rotateX: 0 }}
            animate={
              isChestOpen
                ? { rotateX: 110, y: -50, opacity: 0.8, filter: "brightness(0.5)" }
                : { rotateX: 0, y: isChestOpen ? 0 : [0, -4, 0] }
            }
            transition={{ duration: isChestOpen ? 0.5 : 0.5, repeat: isChestOpen ? 0 : Infinity, repeatDelay: 3 }}
            style={{ transformOrigin: "bottom" }}
          >
            <div className="absolute inset-0 opacity-30 rounded-t-full" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 19px, #000 20px)" }} />
            <div className="absolute left-8 top-0 bottom-0 w-5 bg-[#FFD700] border-x-2 border-[#b8860b] shadow-inner" />
            <div className="absolute right-8 top-0 bottom-0 w-5 bg-[#FFD700] border-x-2 border-[#b8860b] shadow-inner" />

            {!isChestOpen && (
              <motion.div
                className="absolute -bottom-6 w-14 h-20 bg-[#FFD700] rounded-lg border-4 border-[#b8860b] shadow-md flex items-center justify-center"
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                <div className="w-4 h-7 bg-[#3e2723] rounded-full" />
              </motion.div>
            )}
          </motion.div>

          {/* PODPOWIEDŹ - WYRAŹNA */}
          {!isChestOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <span className="text-[#FFD700] font-bold animate-pulse font-serif tracking-widest text-xl md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-b-2 border-[#FFD700] pb-1">
                KLIKNIJ ABY OTWORZYĆ
              </span>
            </motion.div>
          )}
        </div>

        {/* TABLICZKA GRATULACYJNA */}
        <AnimatePresence>
          {isChestOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative w-full mb-8"
            >
              <div className="bg-[#f5deb3] p-8 md:p-10 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border-[5px] border-[#5d4037] text-center transform rotate-1">
                <div className="absolute top-2 left-2 w-3 h-3 bg-[#3e2723] rounded-full" />
                <div className="absolute top-2 right-2 w-3 h-3 bg-[#3e2723] rounded-full" />
                <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#3e2723] rounded-full" />
                <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#3e2723] rounded-full" />

                <h2
                  className="text-3xl md:text-4xl text-[#3e2723] mb-3"
                  style={{ fontFamily: "'Pirata One', cursive" }}
                >
                  Legenda głosi prawdę!
                </h2>
                <p className="text-[#5d4037] font-serif italic text-xl md:text-2xl leading-relaxed">
                  "Zdobyłeś nie tylko złoto, ale i wieczną chwałę na siedmiu morzach!"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRZYCISK RESTART - POWRÓT DO BRĄZU I ZŁOTA (STARE KONTROLKI, ALE DUŻE) */}
        <AnimatePresence>
          {isChestOpen && (
            <motion.button
              onClick={onRestart}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 2, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-10 py-5 bg-[#3e2723] rounded-2xl border-4 border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] transition-all mt-6"
            >
              <div className="flex items-center gap-4">
                <RefreshCcw size={32} className="text-[#FFD700] group-hover:rotate-180 transition-transform duration-500" />
                <span
                  style={{ fontFamily: "'Pirata One', cursive" }}
                  className="text-3xl md:text-4xl text-[#FFD700] tracking-wider"
                >
                  NOWA PRZYGODA
                </span>
              </div>
              <div className="absolute inset-0 border border-[#fff8e1] opacity-20 rounded-xl m-1 pointer-events-none" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}