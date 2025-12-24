import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCcw, Star, Trophy } from "lucide-react";

interface VictoryProps {
  onRestart: () => void;
}

export function Victory({ onRestart }: VictoryProps) {
  const [isChestOpen, setIsChestOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050302] flex items-center justify-center p-4 relative overflow-hidden">
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

      {/* "GOD RAYS" - Obracające się promienie światła za skrzynią */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] z-0 opacity-30 pointer-events-none">
        <motion.div
          className="w-full h-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, #FFD700 15deg, transparent 30deg, #FFD700 45deg, transparent 60deg, #FFD700 75deg, transparent 90deg, #FFD700 105deg, transparent 120deg, #FFD700 135deg, transparent 150deg, #FFD700 165deg, transparent 180deg, #FFD700 195deg, transparent 210deg, #FFD700 225deg, transparent 240deg, #FFD700 255deg, transparent 270deg, #FFD700 285deg, transparent 300deg, #FFD700 315deg, transparent 330deg, #FFD700 345deg, transparent 360deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* DESZCZ MONET */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl z-0"
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
          {
            ["🪙", "👑", "🪙", "👑"][
              Math.floor(Math.random() * 4)
            ]
          }
        </motion.div>
      ))}

      {/* --- GŁÓWNA ZAWARTOŚĆ --- */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
        {/* TYTUŁ */}
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "clamp(3.5rem, 8vw, 6rem)",
            color: "#FFD700",
            textShadow:
              "0 0 20px rgba(255, 215, 0, 0.6), 4px 4px 0px #3e2723",
          }}
        >
          ZWYCIĘSTWO!
        </motion.h1>

        {/* SKRZYNIA SKARBÓW (Interaktywna) */}
        <div
          className="relative w-64 h-64 md:w-80 md:h-80 mb-12 cursor-pointer group"
          onClick={() => setIsChestOpen(true)}
        >
          {/* Blask pod skrzynią */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/60 blur-xl rounded-full" />

          {/* ZAWARTOSC SKRZYNI (Wybucha po otwarciu) */}
          <AnimatePresence>
            {isChestOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1.2, y: -50 }}
                className="absolute bottom-1/2 left-0 right-0 flex justify-center items-end z-0 pointer-events-none"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 blur-[60px] opacity-60" />{" "}
                  {/* Glow */}
                  <motion.div
                    animate={{
                      rotate: [0, -10, 10, 0],
                      y: [-5, 5, -5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="text-9xl relative z-10"
                  >
                    👑
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DÓŁ SKRZYNI */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-[#8d6e63] to-[#3e2723] rounded-b-2xl border-4 border-[#2a1b12] shadow-2xl z-10 flex items-center justify-center overflow-hidden"
            animate={
              isChestOpen ? {} : { rotate: [0, -2, 2, 0] }
            } // Trzęsienie gdy zamknięta
            transition={{
              duration: 0.5,
              repeat: isChestOpen ? 0 : Infinity,
              repeatDelay: 3,
            }}
          >
            {/* Deski */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 19px, #000 20px)",
              }}
            />
            {/* Złote okucia */}
            <div className="absolute left-4 top-0 bottom-0 w-4 bg-[#FFD700] border-x border-[#b8860b] shadow-inner" />
            <div className="absolute right-4 top-0 bottom-0 w-4 bg-[#FFD700] border-x border-[#b8860b] shadow-inner" />
          </motion.div>

          {/* WIECKO SKRZYNI */}
          <motion.div
            className="absolute bottom-28 left-[-10px] right-[-10px] h-24 bg-gradient-to-b from-[#a1887f] to-[#5d4037] rounded-t-full border-4 border-[#2a1b12] shadow-lg z-20 flex items-end justify-center"
            initial={{ rotateX: 0 }}
            animate={
              isChestOpen
                ? {
                    rotateX: 110,
                    y: -40,
                    opacity: 0.8,
                    filter: "brightness(0.5)",
                  }
                : {
                    rotateX: 0,
                    y: isChestOpen ? 0 : [0, -3, 0], // Podskakiwanie
                  }
            }
            transition={{
              duration: isChestOpen ? 0.5 : 0.5,
              repeat: isChestOpen ? 0 : Infinity,
              repeatDelay: 3,
            }}
            style={{ transformOrigin: "bottom" }}
          >
            {/* Deski */}
            <div
              className="absolute inset-0 opacity-30 rounded-t-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 19px, #000 20px)",
              }}
            />
            {/* Złote okucia */}
            <div className="absolute left-6 top-0 bottom-0 w-4 bg-[#FFD700] border-x border-[#b8860b] shadow-inner" />
            <div className="absolute right-6 top-0 bottom-0 w-4 bg-[#FFD700] border-x border-[#b8860b] shadow-inner" />

            {/* Kłódka (Znika po otwarciu) */}
            {!isChestOpen && (
              <motion.div
                className="absolute -bottom-6 w-12 h-16 bg-[#FFD700] rounded-lg border-2 border-[#b8860b] shadow-md flex items-center justify-center"
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                <div className="w-4 h-6 bg-[#3e2723] rounded-full" />
              </motion.div>
            )}
          </motion.div>

          {/* TEKST PODPOWIEDZI */}
          {!isChestOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <span className="text-[#FFD700] font-bold animate-pulse font-serif tracking-widest text-lg drop-shadow-md">
                KLIKNIJ ABY OTWORZYĆ
              </span>
            </motion.div>
          )}
        </div>

        {/* TABLICZKA Z GRATULACJAMI */}
        <AnimatePresence>
          {isChestOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative w-full mb-8"
            >
              <div className="bg-[#f5deb3] p-8 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-[#5d4037] text-center transform rotate-1">
                {/* Ćwieki */}
                <div className="absolute top-2 left-2 w-3 h-3 bg-[#3e2723] rounded-full" />
                <div className="absolute top-2 right-2 w-3 h-3 bg-[#3e2723] rounded-full" />
                <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#3e2723] rounded-full" />
                <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#3e2723] rounded-full" />

                <h2
                  className="text-3xl text-[#3e2723] mb-2"
                  style={{
                    fontFamily: "'Pirata One', cursive",
                  }}
                >
                  Legenda głosi prawdę!
                </h2>
                <p className="text-[#5d4037] font-serif italic text-lg">
                  "Zdobyłeś nie tylko złoto, ale i wieczną
                  chwałę na siedmiu morzach. <br />
                  Załoga wiwatuje na Twoją cześć!"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRZYCISK RESTART - Pojawia się tylko po otwarciu skrzyni */}
        <AnimatePresence>
          {isChestOpen && (
            <motion.button
              onClick={onRestart}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 2, duration: 0.8 }} // 2 sekundy opóźnienia - niech najpierw zobaczą złoto!
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-[#3e2723] rounded-2xl border-4 border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] transition-all mt-4"
            >
              <div className="flex items-center gap-3">
                <RefreshCcw className="text-[#FFD700] group-hover:rotate-180 transition-transform duration-500" />
                <span
                  style={{
                    fontFamily: "'Pirata One', cursive",
                  }}
                  className="text-2xl text-[#FFD700] tracking-wider"
                >
                  NOWA PRZYGODA
                </span>
              </div>
              {/* Ozdobne elementy przycisku */}
              <div className="absolute inset-0 border border-[#fff8e1] opacity-20 rounded-xl m-1 pointer-events-none" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}