import { motion } from "motion/react";
import { Skull, RefreshCcw, XOctagon } from "lucide-react";

interface GameOverProps {
  onRestart: () => void;
}

export function GameOver({ onRestart }: GameOverProps) {
  return (
    <div className="min-h-screen bg-[#0a0505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* TŁO: Mroczna woda / Sztorm */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 30%, rgba(220, 38, 38, 0.15) 0%, rgba(0,0,0,1) 90%),
            repeating-linear-gradient(45deg, #1a0505 0px, #0f0202 20px)
          `,
        }}
      />

      {/* Błyskawice / Czerwone iskry */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[200vw] h-[10px] bg-red-900/20 blur-xl"
          style={{
            left: "-50%",
            top: `${Math.random() * 100}%`,
            rotate: Math.random() * 10 - 5,
          }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            repeatDelay: Math.random() * 5 + 2,
          }}
        />
      ))}

      {/* Bąbelki - bul bul bul */}
      {[...Array(60)].map((_, i) => {
        // Losujemy rozmiar dla każdego bąbelka (od 8px do 35px)
        const size = Math.random() * 25 + 10;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-red-500/20 shadow-[0_0_10px_rgba(220,38,38,0.2)] border border-red-400/30"
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}%`, // Losowa pozycja pozioma
            }}
            initial={{
              y: "120vh",
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              y: "-20vh",
              opacity: [0, 0.6, 0.8, 0], // Ładnie zanikają u góry
              x: [0, Math.random() * 50 - 25, 0], // Kołysanie na boki (sinusoida)
              scale: 1,
            }}
            transition={{
              duration: Math.random() * 10 + 5, // Wolniejsze i szybsze (5s - 15s)
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10, // Rozłożone w czasie starty
            }}
          />
        );
      })}

      {/* --- GŁÓWNA ZAWARTOŚĆ --- */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
        {/* TYTUŁ */}
        <motion.h1
          className="mb-8 text-center"
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "clamp(3.5rem, 8vw, 6rem)",
            color: "#DC2626", // Krwista czerwień
            textShadow:
              "0 0 20px rgba(220, 38, 38, 0.4), 4px 4px 0px #000",
          }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          PRZEGRAŁEŚ!
        </motion.h1>

        {/* IKONA PORAŻKI (Czaszka w kole ratunkowym) */}
        <motion.div
          className="relative mb-12 group"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            delay: 0.3,
          }}
        >
          {/* Koło ratunkowe (pęknięte) */}
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-[16px] border-red-800 bg-[#1a0505] flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.3)] relative overflow-hidden">
            {/* Paski na kole */}
            <div className="absolute inset-0 border-4 border-dashed border-red-900/50 rounded-full opacity-50" />
            <div className="absolute top-0 w-4 h-8 bg-white/20" />
            <div className="absolute bottom-0 w-4 h-8 bg-white/20" />
            <div className="absolute left-0 w-8 h-4 bg-white/20" />
            <div className="absolute right-0 w-8 h-4 bg-white/20" />

            {/* Czaszka */}
            <motion.div
              className="text-8xl md:text-9xl text-gray-400 drop-shadow-2xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ☠️
            </motion.div>

            {/* "Woda" zalewająca koło */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-blue-900/40 blur-sm"
              initial={{ height: "0%" }}
              animate={{ height: "40%" }}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </div>
        </motion.div>

        {/* TABLICZKA Z WIADOMOŚCIĄ (Zniszczona deska) */}
        <motion.div
          className="relative w-full mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-[#2a0a0a] p-8 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-[#450a0a] text-center transform -rotate-1 relative overflow-hidden">
            {/* Tekstura drewna */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 4px, #000 5px)",
              }}
            />

            {/* Gwoździe */}
            <div className="absolute top-3 left-3 w-3 h-3 bg-[#1a0505] rounded-full shadow-inner" />
            <div className="absolute top-3 right-3 w-3 h-3 bg-[#1a0505] rounded-full shadow-inner" />
            <div className="absolute bottom-3 left-3 w-3 h-3 bg-[#1a0505] rounded-full shadow-inner" />
            <div className="absolute bottom-3 right-3 w-3 h-3 bg-[#1a0505] rounded-full shadow-inner" />

            <h2
              className="text-2xl md:text-3xl text-red-500 mb-3"
              style={{ fontFamily: "'Pirata One', cursive" }}
            >
              Cierpliwość pirata się skończyła!
            </h2>
            <p className="text-red-200/80 font-serif italic text-lg leading-relaxed">
              "Twoje słowa nie przekonały kapitana. <br />
              Teraz karmisz ryby na dnie oceanu..."
            </p>
          </div>
        </motion.div>

        {/* PRZYCISK RESTART */}
        <motion.button
          onClick={onRestart}
          className="group relative px-8 py-4 bg-[#450a0a] rounded-2xl border-4 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-all"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center gap-3">
            <RefreshCcw className="text-red-500 group-hover:-rotate-180 transition-transform duration-500" />
            <span
              style={{ fontFamily: "'Pirata One', cursive" }}
              className="text-2xl text-red-500 tracking-wider group-hover:text-red-400 transition-colors"
            >
              SPRÓBUJ PONOWNIE
            </span>
          </div>
          {/* Ozdobne elementy przycisku (pęknięcia) */}
          <div className="absolute inset-0 border border-red-900/30 rounded-xl m-1 pointer-events-none" />
        </motion.button>
      </div>
    </div>
  );
}