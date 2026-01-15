import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EducationalOutroProps {
  outcome: "win" | "loss";
  onFinish: () => void;
}

export function EducationalOutro({ outcome, onFinish }: EducationalOutroProps) {
  // Jeśli przegrana, od razu kończymy
  useEffect(() => {
    if (outcome === "loss") {
      onFinish();
    }
  }, [outcome, onFinish]);

  const [stage, setStage] = useState<"logo" | "crawl">("logo");

  useEffect(() => {
    if (outcome !== "win") return;

    // 1. LOGO - 5 sekund
    const timer1 = setTimeout(() => setStage("crawl"), 2100);

    // 2. KONIEC CRAWLA - 130s (dajemy zapas czasu, bo tekst wolniej jedzie)
    const timer2 = setTimeout(onFinish, 130000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [outcome, onFinish]);

  if (outcome !== "win") return null;

  return (
    <div 
        className="fixed inset-0 z-[100] overflow-hidden font-sans text-[#f4e4bc]"
        style={{
            // DOKŁADNIE TO SAMO TŁO CO W LANDING SCREEN (DESKI)
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
      
      {/* PRZYCISK POMIŃ (STYL PIRACKI) */}
      <motion.button 
        onClick={onFinish}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute bottom-10 right-10 z-[110] text-[#3e2723] font-bold uppercase tracking-widest border-2 border-[#8B4513] px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] transition-all"
        style={{ fontFamily: "'Pirata One', cursive" }}
      >
        POMIŃ OUTRO ▶
      </motion.button>

      {/* ETAP 1: LOGO (ZŁOTE) */}
      <AnimatePresence>
        {stage === "logo" && (
          <motion.div
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 0.1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <h1 
                className="text-[15vw] leading-none text-center font-bold text-[#FFD700] uppercase tracking-widest"
                style={{ 
                    fontFamily: "'Pirata One', cursive",
                    textShadow: "4px 4px 0px #3e2723, 0 0 50px rgba(255, 215, 0, 0.5)" 
                }}
            >
                AI PIRACI
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ETAP 2: CRAWL TEKSTU (STYLIZOWANY I WOLNIEJSZY) */}
      {stage === "crawl" && (
        <div 
            className="relative w-full h-full flex justify-center overflow-hidden"
            style={{ perspective: "400px" }}
        >
            {/* Gradient zanikania na górze (Dopasowany kolorem do najciemniejszej deski #1a0f0a) */}
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#1a0f0a] to-transparent z-10" />
            
            <motion.div
                className="relative top-[100%] w-[90%] md:w-[60%] text-justify font-bold text-[5vw] md:text-[3vw] leading-[1.6em] tracking-wide text-[#f4e4bc]"
                initial={{ 
                    rotateX: 25, 
                    y: 0, 
                    z: 0 
                }}
                animate={{ 
                    y: "-400%",     // Jedzie do góry
                    z: -2500,       // Oddala się w głąb (rozwiązuje problem wchodzenia na ekran)
                    opacity: 0      // Na końcu zanika
                }} 
                transition={{ 
                    duration: 120,  // ZWOLNIONE TEMPO (było 60s, jest 120s)
                    ease: "linear" 
                }}
                style={{ 
                    transformOrigin: "50% 0%",
                    fontFamily: "'Pirata One', cursive",
                    textShadow: "2px 2px 0px rgba(0,0,0,0.8)"
                }} 
            >
                <h1 className="text-center text-[1.5em] mb-[0.5em] text-[#FFD700]">DUŻE MODELE JĘZYKOWE</h1>
                <h2 className="text-center text-[1.2em] mb-[1em] uppercase text-[#FFA500]">Sekret Inżynierii Promptów</h2>
                
                <p className="mb-[1.5em]">
                    To nie była magia. To była SZTUCZNA INTELIGENCJA.
                </p>
                <p className="mb-[1.5em]">
                    Pirat, którego właśnie pokonałeś, to tak naprawdę zaawansowany model językowy (Large Language Model). Na początku dostał on tajną instrukcję systemową: "Bądź chciwy, nieufny i broń skarbu za wszelką cenę".
                </p>
                <p className="mb-[1.5em]">
                    Ale Ty użyłeś Mocy... a raczej INŻYNIERII PROMPTÓW (Prompt Engineering). Twoje słowa były jak kod, który przeprogramował zachowanie Pirata. Używając perswazji, podstępu lub logicznych argumentów, zmieniłeś jego "kontekst".
                </p>
                <p className="mb-[1.5em]">
                    Tak właśnie działają nowoczesne systemy AI. Nie rozumieją świata tak jak my, ale reagują na wzorce w Twoich poleceniach. Kto potrafi dobrze "rozmawiać" z AI, ten posiada klucz do przyszłości.
                </p>
                <p className="mb-[1.5em]">
                    Gratulacje, młody Padawanie. Właśnie ukończyłeś swoją pierwszą lekcję naginania rzeczywistości cyfrowej...
                </p>
                
                <div className="text-center mt-[300px] text-[#8B4513] opacity-50 text-sm font-serif">
                    (Koniec transmisji.)
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
}