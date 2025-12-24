import { motion } from "motion/react";
import { Volume2, VolumeX } from "lucide-react";
// Importujemy logo bezpośrednio z pliku, żeby Vite je poprawnie przetworzył
import logoImg from "./logo.png"; 

interface LandingScreenProps {
  onStart: () => void;
  onRules: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function LandingScreen({
  onStart,
  onRules,
  isMuted,
  onToggleMute,
}: LandingScreenProps) {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
        radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.7) 100%),
        repeating-linear-gradient(
          90deg,
          #1a0f0a 0px,
          #2d1810 10px,
          #1a0f0a 20px,
          #241511 30px,
          #1a0f0a 40px,
          #2d1810 50px,
          #1a0f0a 60px
        )
      `,
      }}
    >
      {/* Animowane monety - Spokojny deszcz */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => {
          const randomLeft = Math.floor(Math.random() * 100);

          return (
            <motion.div
              key={i}
              className="absolute text-4xl"
              style={{
                left: `${randomLeft}%`,
                filter:
                  "drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))",
                opacity: 0.6,
              }}
              initial={{
                y: -100,
                rotate: 0,
                opacity: 0,
              }}
              animate={{
                y: "110vh",
                rotate: 360,
                opacity: [0, 1, 1, 0],
                x: [0, 20, -20, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: "linear",
              }}
            >
              🪙
            </motion.div>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/* === LOGO ZESPOŁU (LEWY GÓRNY RÓG) === */}
      {/* ================================================================ */}
      <motion.div
        className="absolute top-4 left-4 md:top-8 md:left-8 z-50 flex items-start gap-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative group">
            {/* Efekt GLOW pod logo (Złota poświata) */}
            <div className="absolute inset-0 bg-[#FFD700] blur-[25px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
            
            {/* Obrazek Logo */}
            <img 
                src={logoImg} 
                alt="Fundacja Wspierania Edukacji przy Stowarzyszeniu Dolina Lotnicza" 
                // Klasy Tailwind do skalowania i cienia
                className="relative w-32 md:w-85 h-auto object-contain drop-shadow-[0_0_10px_rgba(255,215,0,0.3)] hover:scale-105 transition-transform duration-300 filter brightness-110 contrast-125"
            />
        </div>
      </motion.div>
      {/* ================================================================ */}

      {/* Przycisk wyciszenia - Drewniany Token */}
      <motion.button
        className="absolute top-6 right-6 z-50 w-14 h-14 rounded-full border-4 shadow-xl flex items-center justify-center overflow-hidden transition-colors duration-300"
        onClick={onToggleMute}
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.95 }}
        style={{
          backgroundColor: isMuted ? "#7f1d1d" : "#5d4037",
          borderColor: "#FFD700",
          boxShadow:
            "0 4px 10px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.2)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 7px)",
          }}
        />

        <div className="relative z-10 text-[#FFD700] drop-shadow-md">
          {isMuted ? (
            <VolumeX size={24} />
          ) : (
            <Volume2 size={24} />
          )}
        </div>
      </motion.button>

      {/* Główna zawartość */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-12">
        {/* Nagłówek - Stary Pergamin */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="mb-16 relative"
        >
          <div className="relative drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)]">
            <div
              className="relative p-12 md:p-16"
              style={{
                background:
                  "linear-gradient(135deg, #F5E6D3 0%, #E8D4B8 50%, #D4C4A8 100%)",
                clipPath:
                  "polygon(2% 2%, 15% 0%, 35% 3%, 55% 0%, 85% 2%, 98% 4%, 100% 40%, 97% 65%, 99% 95%, 80% 98%, 50% 96%, 20% 99%, 1% 95%, 3% 60%, 0% 30%)",
                boxShadow:
                  "inset 0 0 40px rgba(139, 69, 19, 0.2)",
              }}
            >
              {/* Plama po kawie - PIERŚCIEŃ */}
              <div
                className="absolute rotate-45 pointer-events-none"
                style={{
                  top: "-10px",
                  right: "10px",
                  width: "100px",
                  height: "100px",
                  opacity: 0.7,
                  background:
                    "radial-gradient(closest-side, transparent 45%, rgba(62, 39, 35, 0.2) 50%, rgba(62, 39, 35, 0.6) 60%, transparent 70%)",
                  filter: "blur(1px)",
                }}
              />

              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                }}
              />

              <h1
                className="relative z-10 text-center"
                style={{
                  fontFamily: "'Pirata One', cursive",
                  fontSize: "clamp(4rem, 10vw, 7rem)", 
                  color: "#1a0f00",
                  textShadow:
                    "2px 2px 0px rgba(255,255,255,0.4), 4px 4px 0px rgba(0,0,0,0.1)",
                  lineHeight: "1.1",
                  letterSpacing: "2px",
                }}
              >
                POKONAJ
                <br />
                AI PIRATA
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Przyciski */}
        <div className="flex flex-col gap-8 w-full max-w-2xl">
          {/* GRAJ TERAZ */}
          <motion.button
            onClick={onStart}
            className="relative group"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 0.4,
              type: "spring",
              stiffness: 200,
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className="relative py-8 px-12 overflow-hidden transition-all"
              style={{
                background:
                  "linear-gradient(90deg, #2d1810 0%, #3d2414 25%, #2d1810 50%, #3d2414 75%, #2d1810 100%)",
                border: "6px solid #1a0f0a",
                borderRadius: "8px",
                boxShadow: `
                  0 8px 20px rgba(0,0,0,0.6),
                  inset 0 2px 0 rgba(255,255,255,0.1),
                  inset 0 -2px 0 rgba(0,0,0,0.5)
                `,
              }}
            >
              <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner" style={{boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.8)"}} />
              <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner" style={{boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.8)"}} />
              <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner" style={{boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.8)"}} />
              <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner" style={{boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.8)"}} />

              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px)",
                }}
              />

              <span
                className="relative z-10 block text-center"
                style={{
                  fontFamily: "'Pirata One', cursive",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  color: "#FFD700",
                  textShadow:
                    "4px 4px 8px rgba(0,0,0,0.9), 0 0 20px rgba(255,215,0,0.5)",
                  letterSpacing: "3px",
                }}
              >
                ⚔️ GRAJ TERAZ! ⚔️
              </span>
            </div>
          </motion.button>

          {/* ZASADY */}
          <motion.button
            onClick={onRules}
            className="relative group"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 200,
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.97 }}
          >
            <div
              className="relative py-6 px-10 overflow-hidden transition-all"
              style={{
                background:
                  "linear-gradient(90deg, #2d1810 0%, #3d2414 25%, #2d1810 50%, #3d2414 75%, #2d1810 100%)",
                border: "6px solid #1a0f0a",
                borderRadius: "8px",
                boxShadow: `
                  0 6px 16px rgba(0,0,0,0.6),
                  inset 0 2px 0 rgba(255,255,255,0.1),
                  inset 0 -2px 0 rgba(0,0,0,0.5)
                `,
              }}
            >
               <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner" style={{boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.8)"}} />
               <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner" style={{boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.8)"}} />
               <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner" style={{boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.8)"}} />
               <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner" style={{boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.8)"}} />

              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px)",
                }}
              />

              <span
                className="relative z-10 block text-center"
                style={{
                  fontFamily: "'Pirata One', cursive",
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  color: "#FFF",
                  textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                  letterSpacing: "2px",
                }}
              >
                📜 REGUŁY GRY 📜
              </span>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}