import { motion } from "motion/react";
import { Skull, RefreshCcw, Bone } from "lucide-react";

interface GameOverProps {
  onRestart: () => void;
}

export function GameOver({ onRestart }: GameOverProps) {
  return (
    <div className="min-h-screen bg-[#0a0505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* TŁO: KRWAWA GŁĘBIA */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 40%, rgba(69, 10, 10, 0.4) 0%, rgba(0,0,0,1) 90%),
            repeating-linear-gradient(45deg, #1a0505 0px, #0f0202 20px)
          `,
        }}
      />

      {/* BĄBELKI POWIETRZA (POPRAWIONE - WIDOCZNE) */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          // Zmieniono kolory na jaśniejsze (czerwono-białe) i dodano blur
          className="absolute rounded-full border border-red-300/20 bg-red-200/10 backdrop-blur-[1px]"
          style={{
            left: `${Math.random() * 100}%`,
            width: Math.random() * 35 + 5,
            height: Math.random() * 35 + 5,
          }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ 
            y: "-10vh", 
            opacity: [0, 0.7, 0], // Zwiększona widoczność
            x: [0, Math.random() * 40 - 20, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        />
      ))}

      {/* WODA ZALEWAJĄCA EKRAN (CIENIE NA DOLE) */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[#1a0505] to-transparent pointer-events-none"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "40vh" }}
        transition={{ duration: 4 }}
      />

      {/* --- GŁÓWNA ZAWARTOŚĆ --- */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
        
        {/* TYTUŁ (GIGANT) */}
        <motion.h1
          className="mb-8 md:mb-16 text-center"
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "clamp(4rem, 12vw, 8rem)",
            color: "#DC2626", 
            textShadow: "0 0 30px rgba(220, 38, 38, 0.5), 6px 6px 0px #000",
            lineHeight: 1,
            letterSpacing: "4px"
          }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          KONIEC GRY
        </motion.h1>

        {/* IKONA ŚMIERCI - JOLLY ROGER */}
        <motion.div
          // ZMNIEJSZONY MARGINES DOLNY (było mb-20 md:mb-28) -> podciąga resztę do góry
          className="relative mb-8 md:mb-12 group cursor-default"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 60, damping: 12, delay: 0.3 }}
        >
          {/* Mroczna poświata */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-900/30 blur-[100px] rounded-full animate-pulse" />

          {/* Kontener czaszki i kości */}
          <div className="relative flex items-center justify-center">
             
             {/* Piszczele (Tło) */}
             <div className="absolute opacity-80">
                <Bone 
                    size={320} 
                    className="absolute text-[#3f0e0e] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45" 
                    strokeWidth={2.5}
                />
                <Bone 
                    size={320} 
                    className="absolute text-[#3f0e0e] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45" 
                    strokeWidth={2.5}
                />
             </div>

             {/* Czaszka (Przód) */}
             <div className="relative z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,1)]">
                <Skull 
                    size={260} 
                    className="text-[#2a0a0a] fill-[#1a0505]"
                    strokeWidth={1.5}
                />
                
                {/* Świecące oczy */}
                <motion.div 
                    className="absolute top-[38%] left-[27%] w-[13%] h-[15%] bg-red-600 rounded-full blur-[6px] mix-blend-screen"
                    animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                    className="absolute top-[38%] right-[27%] w-[13%] h-[15%] bg-red-600 rounded-full blur-[6px] mix-blend-screen"
                    animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                />
             </div>
          </div>
          {/* USUNIĘTO NAPIS R.I.P STĄD */}
        </motion.div>

        {/* KOMUNIKAT O PORAŻCE */}
        <motion.div
          className="relative w-full mb-10 max-w-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-[#1a0505] p-8 md:p-10 rounded-2xl border-[6px] border-[#450a0a] shadow-[0_0_40px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
            {/* Pęknięcia */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-red-900/30 rounded-tl-xl" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-red-900/30 rounded-br-xl" />

            <h2
              className="text-3xl md:text-5xl text-red-600 mb-4"
              style={{ fontFamily: "'Pirata One', cursive" }}
            >
              Cierpliwość się skończyła!
            </h2>
            <p className="text-red-200/60 font-serif italic text-xl md:text-2xl leading-relaxed">
              "Twoje słowa nie przekonały kapitana. <br />
              Teraz karmisz ryby na dnie oceanu..."
            </p>
          </div>
        </motion.div>

        {/* PRZYCISK RESTART - GIGANT */}
        <motion.button
          onClick={onRestart}
          className="group relative px-10 py-5 bg-[#450a0a] rounded-2xl border-4 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.15)] hover:shadow-[0_0_50px_rgba(220,38,38,0.4)] transition-all mt-2 w-full max-w-lg"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center justify-center gap-4">
            <RefreshCcw size={32} className="text-red-500 group-hover:-rotate-180 transition-transform duration-500" />
            <span
              style={{ fontFamily: "'Pirata One', cursive" }}
              className="text-3xl md:text-4xl text-red-500 tracking-wider group-hover:text-red-400 transition-colors"
            >
              SPRÓBUJ PONOWNIE
            </span>
          </div>
          <div className="absolute inset-0 border border-red-500/20 rounded-xl m-1 pointer-events-none" />
        </motion.button>
      </div>
    </div>
  );
}