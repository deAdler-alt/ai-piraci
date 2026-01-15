import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface GameOverProps {
  onRestart: () => void;
}

export function GameOver({ onRestart }: GameOverProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#050302] overflow-hidden font-sans text-center px-4">
      
      {/* TŁO: Czerwony winieta i kraty */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#3e0000_100%)] z-0" />
      
      {/* PIONOWE KRATY (Animowane wejście) */}
      <div className="absolute inset-0 flex justify-around pointer-events-none opacity-30 z-10">
        {[...Array(6)].map((_, i) => (
             <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="w-4 h-full bg-gradient-to-b from-[#2a1b12] via-[#000] to-[#2a1b12] shadow-2xl" 
             />
        ))}
      </div>

      <div className="relative z-20 flex flex-col items-center max-w-2xl w-full">
        
        {/* IKONA KŁÓDKI (Trzęsąca się) */}
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mb-8 relative"
        >
            <div className="absolute inset-0 bg-red-600 blur-[50px] opacity-20 animate-pulse" />
            <motion.div
                animate={{ x: [-5, 5, -5, 5, 0] }}
                transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.5 }}
            >
                <Lock size={120} className="text-[#c2410c] drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]" />
            </motion.div>
        </motion.div>

        {/* NAGŁÓWEK */}
        <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-8xl text-[#c2410c] mb-4" 
            style={{ fontFamily: "'Pirata One', cursive", textShadow: "4px 4px 0px #000" }}
        >
            PORAŻKA
        </motion.h1>

        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-400 mb-10 font-serif max-w-lg"
        >
            "Pirat przejrzał Twoje sztuczki. Skarb pozostaje bezpiecznie zamknięty pod pokładem."
        </motion.p>

        {/* PRZYCISK */}
        <motion.button
            onClick={onRestart}
            whileHover={{ scale: 1.05, backgroundColor: "#b91c1c" }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#7f1d1d] text-white px-10 py-4 rounded-lg font-bold text-lg md:text-xl border-2 border-[#fca5a5] shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-colors z-30 cursor-pointer"
        >
            SPRÓBUJ PONOWNIE ↺
        </motion.button>
      </div>
    </div>
  );
}