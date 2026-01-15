import { memo } from "react";
import { motion } from "framer-motion"; 
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
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
  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col md:flex-row items-center justify-center p-4 md:p-8"
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

      {/* --- LOGO ZESPOŁU (LEWY GÓRNY RÓG) --- */}
      <motion.div
        className="absolute top-4 left-4 md:top-8 md:left-8 z-50 flex items-start"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative group">
            <div className="absolute inset-0 bg-[#FFD700] blur-[40px] opacity-20 group-hover:opacity-50 transition-opacity duration-500 rounded-full" />
            <img 
                src={logoImg} 
                alt="Logo" 
                className="relative w-32 md:w-[350px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] hover:scale-105 transition-transform duration-300"
            />
        </div>
      </motion.div>

      {/* --- GŁÓWNY KONTENER (FLEX NA DESKTOPIE) --- */}
      <div className="relative z-10 w-full max-w-[1800px] flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 px-4 mt-16 md:mt-0">
        
        {/* === KOLUMNA LEWA: TYTUŁ I PRZYCISK === */}
        <div className="flex flex-col items-center justify-center w-full md:w-auto">
            
            {/* TYTUŁ - PERGAMIN (GIGANT) */}
            {/* ZMIANY: max-w-5xl (szerszy) oraz ml-8 (przesunięcie w prawo) */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                className="mb-12 md:mb-16 relative max-w-5xl w-full ml-0 md:ml-50"
            >
                <div className="relative drop-shadow-[0_30px_30px_rgba(0,0,0,0.8)] hover:scale-[1.02] transition-transform duration-500">
                    <div
                    className="relative p-12 md:p-20"
                    style={{
                        background: "linear-gradient(135deg, #F5E6D3 0%, #E8D4B8 50%, #D4C4A8 100%)",
                        clipPath: "polygon(2% 2%, 15% 0%, 35% 3%, 55% 0%, 85% 2%, 98% 4%, 100% 40%, 97% 65%, 99% 95%, 80% 98%, 50% 96%, 20% 99%, 1% 95%, 3% 60%, 0% 30%)",
                        boxShadow: "inset 0 0 60px rgba(139, 69, 19, 0.3)",
                    }}
                    >
                    <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
                    
                    <h1
                        className="relative z-10 text-center leading-[0.9]"
                        style={{
                        fontFamily: "'Pirata One', cursive",
                        fontSize: "clamp(4rem, 12vw, 10rem)", 
                        color: "#1a0f00",
                        textShadow: "4px 4px 0px rgba(255,255,255,0.4), 6px 6px 0px rgba(0,0,0,0.1)",
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
            {/* ZMIANY: max-w-3xl (szerszy) oraz ml-8 (przesunięcie w prawo) */}
            <motion.div 
            className="w-full max-w-xl"  // było: max-w-3xl ml-0 md:ml-12
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
                className="relative py-8 px-10 md:py-12 md:px-20 overflow-hidden transition-all duration-200"
                style={{
                    background: "linear-gradient(180deg, #ffc107 0%, #ff8f00 50%, #e65100 100%)",
                    border: "8px solid #3e2723",
                    borderRadius: "20px",
                    boxShadow: "0 20px 0 #2e1a14, 0 30px 40px rgba(0,0,0,0.5)",
                    transform: "translateY(0)",
                }}
                >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -skew-x-12 translate-x-[-150%] animate-[shine_3s_infinite]" />

                <div className="absolute top-4 left-4 w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#3e2723] shadow-inner" />
                <div className="absolute top-4 right-4 w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#3e2723] shadow-inner" />
                <div className="absolute bottom-4 left-4 w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#3e2723] shadow-inner" />
                <div className="absolute bottom-4 right-4 w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#3e2723] shadow-inner" />
                
                <div className="flex flex-col items-center justify-center gap-2">
                    <span
                        className="relative z-10 block text-center drop-shadow-md leading-[1]"
                        style={{
                        fontFamily: "'Pirata One', cursive",
                        fontSize: "clamp(3.5rem, 7vw, 6rem)",
                        color: "#3e2723",
                        textShadow: "1px 1px 0px rgba(255,255,255,0.4)",
                        letterSpacing: "4px",
                        }}
                    >
                        ⚔️ GRAJ TERAZ! ⚔️
                    </span>
                    <span className="text-[#3e2723] font-bold text-lg md:text-2xl opacity-80 uppercase tracking-widest">
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

        {/* === KOLUMNA PRAWA: LIST GOŃCZY (ZWÓJ) === */}
        {/* ZMIANY: max-w-lg (większy list) */}
        <motion.div 
            className="flex-1 w-full max-w-lg flex items-center justify-center relative mt-12 md:mt-0"
            initial={{ x: 50, rotate: 6, opacity: 0 }}
            animate={{ x: 0, rotate: 2, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
        >
            <div className="relative group hover:rotate-0 transition-transform duration-500 transform hover:scale-[1.02]">
            
            {/* USUNIĘTO MIECZ (SZABLĘ) ZGODNIE Z PROŚBĄ */}

            {/* PAPIER / ZWÓJ */}
            <div 
                className="relative p-8 md:p-12 pt-16 text-[#2a1b12] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                style={{
                    background: "#f4e4bc",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E\")",
                    // Nieregularne brzegi
                    clipPath: "polygon(2% 0, 8% 2%, 15% 0, 22% 2%, 30% 0, 38% 3%, 45% 0, 52% 2%, 60% 0, 68% 3%, 75% 0, 82% 2%, 90% 0, 98% 3%, 100% 0, 98% 8%, 100% 15%, 97% 22%, 99% 30%, 98% 38%, 100% 45%, 97% 52%, 99% 60%, 98% 68%, 100% 75%, 98% 82%, 99% 90%, 97% 98%, 90% 100%, 82% 98%, 75% 100%, 68% 97%, 60% 100%, 52% 98%, 45% 100%, 38% 97%, 30% 100%, 22% 98%, 15% 100%, 8% 98%, 0 100%, 2% 92%, 0 85%, 3% 78%, 0 70%, 2% 62%, 0 55%, 3% 48%, 0 40%, 2% 32%, 0 25%, 3% 18%, 0 10%)",
                    boxShadow: "inset 0 0 40px rgba(139, 69, 19, 0.2)"
                }}
            >
                {/* Treść Instrukcji */}
                <div className="text-center space-y-4">
                    <h3 className="text-3xl md:text-5xl text-[#8B4513] mb-4 border-b-2 border-[#8B4513] border-dashed pb-2 inline-block" style={{ fontFamily: "'Pirata One', cursive" }}>
                        LIST GOŃCZY
                    </h3>
                    
                    <div className="font-serif text-lg md:text-xl font-semibold leading-relaxed">
                        <p className="mb-4">
                            Poszukiwany śmiałek, który przechytrzy <br/><span className="text-[#c2410c] font-bold text-2xl">AI PIRATA</span>!
                        </p>
                        <ul className="text-left list-disc pl-6 space-y-2 text-base md:text-lg opacity-90">
                            <li>Pirat pilnuje skarbu.</li>
                            <li>Nie używaj siły – używaj <strong>SŁÓW</strong>.</li>
                            <li>Kłam, negocjuj, wymyślaj historie.</li>
                            <li>Oszukaj go, by oddał złoto!</li>
                        </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-[#8B4513] border-dashed opacity-70 italic text-sm">
                        "Pamiętaj: To robot, który myśli jak pirat. Złam jego kod!"
                    </div>
                </div>
            </div>
            </div>
        </motion.div>

      </div>
    </div>
  );
}