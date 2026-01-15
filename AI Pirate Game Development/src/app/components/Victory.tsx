import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Award, Star, Trophy, Scroll } from "lucide-react";
import { GameStats } from "../hooks/useGameEngine"; 

interface VictoryProps {
  onRestart: () => void;
  isMuted: boolean;
  stats: GameStats | null;
}

export function Victory({ onRestart, isMuted, stats }: VictoryProps) {
  
  // 1. FANFARY I DZWIĘKI NA WEJŚCIE
  useEffect(() => {
    if (!isMuted) {
      const trumpet = new Audio("/sounds/win_1_trumpet.mp3");
      trumpet.volume = 0.5;
      trumpet.play().catch(() => {});

      // Monetki chwilę później
      setTimeout(() => {
        const coins = new Audio("/sounds/win_2_coins.mp3");
        coins.volume = 0.6;
        coins.play().catch(() => {});
      }, 800);
    }
  }, [isMuted]);

  return (
    <div className="min-h-screen bg-[#050302] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* TŁO: JASKINIA SKARBÓW */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 60%, rgba(255, 215, 0, 0.15) 0%, rgba(0,0,0,1) 80%), repeating-linear-gradient(45deg, #1a120b 0px, #0f0906 20px)` }} />

      {/* GOD RAYS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] z-0 opacity-30 pointer-events-none">
        <motion.div
          className="w-full h-full"
          style={{ background: "conic-gradient(from 0deg, transparent 0deg, #FFD700 15deg, transparent 30deg, #FFD700 45deg, transparent 60deg, #FFD700 75deg, transparent 90deg, #FFD700 105deg, transparent 120deg, #FFD700 135deg, transparent 150deg, #FFD700 165deg, transparent 180deg, #FFD700 195deg, transparent 210deg, #FFD700 225deg, transparent 240deg, #FFD700 255deg, transparent 270deg, #FFD700 285deg, transparent 300deg, #FFD700 315deg, transparent 330deg, #FFD700 345deg, transparent 360deg)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* DESZCZ MONET */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl md:text-6xl z-0 pointer-events-none"
          initial={{ x: Math.random() * window.innerWidth, y: -100, rotate: 0, opacity: 0 }}
          animate={{ y: window.innerHeight + 100, rotate: 360, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
        >
          {["🪙", "👑", "💎", "🏆"][Math.floor(Math.random() * 4)]}
        </motion.div>
      ))}

      {/* === GŁÓWNA ZAWARTOŚĆ === */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-7xl">
        
        {/* TYTUŁ */}
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8 md:mb-12"
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "clamp(4rem, 10vw, 7rem)",
            color: "#FFD700",
            textShadow: "0 0 25px rgba(255, 215, 0, 0.6), 4px 4px 0px #3e2723",
            lineHeight: 1,
            letterSpacing: "3px"
          }}
        >
          ZWYCIĘSTWO!
        </motion.h1>

        {/* SCENA: PIRAT vs WYNIK */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 w-full">
            
            {/* 1. PORTRET PIRATA (RAMA) */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="relative flex flex-col items-center"
            >
                {/* Złota/Drewniana Rama */}
                <div className="relative w-[300px] h-[400px] bg-[#2a1b12] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-[8px] border-[#5d4037] overflow-hidden">
                     {/* Wewnętrzna złota ramka */}
                     <div className="absolute inset-0 border-[4px] border-[#FFD700] rounded opacity-70 z-20 pointer-events-none shadow-[inset_0_0_20px_black]" />
                     
                     <img 
                        src="/characters/korsarz/defeated.png" 
                        alt="Pirat" 
                        className="w-full h-full object-cover grayscale contrast-125 brightness-75 scale-110"
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerText = "☠️"; }}
                     />
                     
                     {/* Płacz */}
                     <motion.div className="absolute top-[40%] left-[35%] text-5xl pointer-events-none z-10" initial={{ y: 0, opacity: 0 }} animate={{ y: 100, opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>💧</motion.div>
                     <motion.div className="absolute top-[40%] right-[35%] text-5xl pointer-events-none z-10" initial={{ y: 0, opacity: 0 }} animate={{ y: 100, opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}>💧</motion.div>

                     {/* Tabliczka z imieniem (na dole ramy) */}
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] bg-[#1a0f0a] border border-[#FFD700] text-[#FFD700] text-center py-1 font-serif text-sm uppercase tracking-widest z-30 shadow-lg">
                        Pokonany Pirat
                     </div>
                </div>

                {/* Dymek dialogowy */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-6 -right-16 bg-white text-black p-4 rounded-xl rounded-bl-none shadow-xl max-w-[200px] text-center font-bold font-serif border-2 border-black rotate-3 z-40"
                >
                    "O nieee! Moja emerytura! <br/> Bierz to złoto i znikaj!"
                </motion.div>
            </motion.div>

            {/* 2. RAPORT Z MISJI (Fancy Karta) */}
            {stats && (
                <motion.div
                    initial={{ opacity: 0, x: 50, rotate: 2 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.4, delay: 0.3 }}
                    className="relative bg-[#f4e4bc] w-[340px] md:w-[420px] p-1 shadow-[0_20px_60px_rgba(0,0,0,0.8)] transform rotate-1"
                >
                    {/* Wewnętrzny kontener z obramowaniem */}
                    <div className="border-[4px] border-[#8B4513] border-double p-6 h-full relative bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]">
                        
                        {/* Woskowa Pieczęć */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 z-50 drop-shadow-xl rotate-12">
                             <div className="w-full h-full bg-[#991b1b] rounded-full border-[6px] border-[#7f1d1d] flex items-center justify-center shadow-inner">
                                <span className="text-[#fecaca] font-bold text-[10px] uppercase text-center leading-tight tracking-tight">
                                    PIECZĄTKA JAKOŚĆI<br/>
                                </span>
                             </div>
                        </div>

                        {/* Nagłówek */}
                        <div className="text-center border-b-2 border-[#8B4513] pb-4 mb-6">
                            <h3 className="text-4xl text-[#3e2723] drop-shadow-sm" style={{ fontFamily: "'Pirata One', cursive" }}>
                                RAPORT
                            </h3>
                            <div className="flex justify-center items-center gap-2 text-[#8B4513] text-sm font-serif uppercase tracking-widest mt-1 opacity-70">
                                <Scroll size={14} /> Oficjalny Werdykt
                            </div>
                        </div>
                        
                        {/* Wyniki */}
                        <div className="space-y-4 font-serif text-lg text-[#2a1b12]">
                            
                            {/* Technika */}
                            <div className="flex justify-between items-center bg-[#e6d2b5]/50 p-3 rounded border border-[#d2b48c]">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#5d4037] text-white p-1.5 rounded"><Award size={18} /></div>
                                    <span className="font-bold">Technika</span>
                                </div>
                                <span className="font-bold text-2xl">{stats.technique}/100</span>
                            </div>
                            
                            {/* Styl */}
                            <div className="flex justify-between items-center bg-[#e6d2b5]/50 p-3 rounded border border-[#d2b48c]">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#b45309] text-white p-1.5 rounded"><Star size={18} /></div>
                                    <span className="font-bold">Styl (Czas)</span>
                                </div>
                                <span className="font-bold text-2xl text-[#b45309]">+{stats.style} pkt</span>
                            </div>

                            {/* Suma */}
                            <div className="mt-6 pt-4 border-t-2 border-[#8B4513] border-dashed flex justify-between items-end">
                                <span className="text-[#5d4037] font-bold uppercase text-sm tracking-widest mb-1">Nota Łączna</span>
                                <span className="text-6xl font-bold text-[#b45309] leading-none" style={{ fontFamily: "'Pirata One', cursive" }}>
                                    {stats.total}
                                </span>
                            </div>
                        </div>

                        {/* Ranga (Wstęga) */}
                        <div className="mt-8 relative h-16 flex items-center justify-center">
                            <div className="absolute inset-0 bg-[#3e2723] transform -skew-x-12 shadow-lg border-2 border-[#5d4037]"></div>
                            <div className="relative z-10 flex items-center gap-3 text-[#FFD700]">
                                <Trophy size={24} />
                                <span className="text-2xl tracking-wide uppercase" style={{ fontFamily: "'Pirata One', cursive" }}>
                                    {stats.grade}
                                </span>
                            </div>
                        </div>

                    </div>
                </motion.div>
            )}
        </div>

        {/* PRZYCISK NOWA PRZYGODA */}
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-16 md:mt-20"
        >
                <button
                onClick={onRestart}
                className="group relative px-16 py-6 bg-gradient-to-b from-[#3e2723] to-[#2a1b12] rounded-2xl border-[3px] border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.2)] hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] hover:scale-105 transition-all duration-300"
                >
                <div className="flex items-center gap-4 relative z-10">
                    <RefreshCcw size={32} className="text-[#FFD700] group-hover:rotate-180 transition-transform duration-700" />
                    <span
                    style={{ fontFamily: "'Pirata One', cursive" }}
                    className="text-4xl text-[#FFD700] tracking-wider drop-shadow-md"
                    >
                    NOWA PRZYGODA
                    </span>
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                </button>
        </motion.div>

      </div>
    </div>
  );
}