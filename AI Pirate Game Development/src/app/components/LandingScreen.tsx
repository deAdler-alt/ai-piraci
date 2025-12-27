import { memo } from "react";
import { motion } from "motion/react";
import logoImg from "./logo.png";

interface LandingScreenProps {
  onStart: () => void;
  onRules: () => void; 
  isMuted: boolean;          
  onToggleMute: () => void; 
}

// === TŁO Z MONETAMI (MEMOIZED) ===
const BackgroundCoins = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => {
        const randomLeft = Math.floor(Math.random() * 100);
        return (
          <motion.div
            key={i}
            className="absolute text-5xl md:text-7xl"
            style={{
              left: `${randomLeft}%`,
              filter: "drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))",
              opacity: 0.6,
            }}
            initial={{
              y: -150,
              rotate: 0,
              opacity: 0,
            }}
            animate={{
              y: "110vh",
              rotate: 360,
              opacity: [0, 1, 1, 0],
              x: [0, 30, -30, 0],
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
  );
});

export function LandingScreen({ onStart }: LandingScreenProps) {
  // UWAGA: onRules, isMuted, onToggleMute są w propsach (dla zgodności z App.tsx),
  // ale celowo ich nie używamy w tym "czystym" layoutcie, zgodnie z życzeniem.
  
  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center"
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
      <BackgroundCoins />

      {/* LOGO ZESPOŁU (GIGANT) */}
      <motion.div
        className="absolute top-6 left-6 md:top-10 md:left-10 z-50 flex items-start"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative group">
            <div className="absolute inset-0 bg-[#FFD700] blur-[40px] opacity-20 group-hover:opacity-50 transition-opacity duration-500 rounded-full" />
            <img 
                src={logoImg} 
                alt="Logo" 
                className="relative w-48 md:w-[400px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] hover:scale-105 transition-transform duration-300"
            />
        </div>
      </motion.div>

      {/* GŁÓWNA ZAWARTOŚĆ */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4">
        
        {/* TYTUŁ - PERGAMIN (GIGANT) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          className="mb-16 md:mb-24 relative max-w-5xl w-full"
        >
          <div className="relative drop-shadow-[0_30px_30px_rgba(0,0,0,0.8)] hover:scale-[1.02] transition-transform duration-500">
            <div
              className="relative p-16 md:p-24"
              style={{
                background: "linear-gradient(135deg, #F5E6D3 0%, #E8D4B8 50%, #D4C4A8 100%)",
                clipPath: "polygon(2% 2%, 15% 0%, 35% 3%, 55% 0%, 85% 2%, 98% 4%, 100% 40%, 97% 65%, 99% 95%, 80% 98%, 50% 96%, 20% 99%, 1% 95%, 3% 60%, 0% 30%)",
                boxShadow: "inset 0 0 60px rgba(139, 69, 19, 0.3)",
              }}
            >
              <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
              
              <h1
                className="relative z-10 text-center"
                style={{
                  fontFamily: "'Pirata One', cursive",
                  fontSize: "clamp(5rem, 13vw, 11rem)", 
                  color: "#1a0f00",
                  textShadow: "4px 4px 0px rgba(255,255,255,0.4), 6px 6px 0px rgba(0,0,0,0.1)",
                  lineHeight: "1.0",
                  letterSpacing: "4px",
                }}
              >
                POKONAJ
                <br />
                <span className="text-[#3e2723]">AI PIRATA</span>
              </h1>
            </div>
          </div>
        </motion.div>

        {/* PRZYCISK GRAJ (GIGANT) */}
        <motion.div 
            className="w-full max-w-3xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
        >
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-full cursor-pointer outline-none select-none"
          >
            {/* Tło przycisku */}
            <div
              className="relative py-12 px-8 overflow-hidden transition-all duration-200"
              style={{
                background: "linear-gradient(180deg, #ffc107 0%, #ff8f00 50%, #e65100 100%)",
                border: "8px solid #3e2723",
                borderRadius: "20px",
                boxShadow: "0 20px 0 #2e1a14, 0 30px 40px rgba(0,0,0,0.5)",
                transform: "translateY(0)",
              }}

            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -skew-x-12 translate-x-[-150%] animate-[shine_3s_infinite]" />

              <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-[#3e2723] shadow-inner" />
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#3e2723] shadow-inner" />
              <div className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-[#3e2723] shadow-inner" />
              <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-[#3e2723] shadow-inner" />
              
              <div className="flex flex-col items-center justify-center gap-2">
                <span
                    className="relative z-10 block text-center drop-shadow-md"
                    style={{
                    fontFamily: "'Pirata One', cursive",
                    fontSize: "clamp(3.5rem, 8vw, 6rem)",
                    color: "#3e2723",
                    textShadow: "1px 1px 0px rgba(255,255,255,0.4)",
                    letterSpacing: "4px",
                    lineHeight: 1,
                    }}
                >
                    ⚔️ GRAJ TERAZ! ⚔️
                </span>
                <span className="text-[#3e2723] font-bold text-xl md:text-2xl opacity-80 uppercase tracking-widest">
                    Kliknij, aby rozpocząć przygodę
                </span>
              </div>
            </div>
            
            <style>{`
                .group:active > div {
                    transform: translateY(16px);
                    box-shadow: 0 4px 0 #2e1a14, 0 10px 20px rgba(0,0,0,0.5);
                }
                @keyframes shine {
                    0% { transform: translateX(-150%) skewX(-12deg); }
                    20% { transform: translateX(150%) skewX(-12deg); }
                    100% { transform: translateX(150%) skewX(-12deg); }
                }
            `}</style>
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}