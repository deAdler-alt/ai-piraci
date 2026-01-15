import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface EducationalOutroProps {
  outcome: "win" | "loss";
  onFinish: () => void;
}

export function EducationalOutro({ outcome, onFinish }: EducationalOutroProps) {
  const [skipVisible, setSkipVisible] = useState(false);

  // Pokaż przycisk "Pomiń" po 3 sekundach
  useEffect(() => {
    const timer = setTimeout(() => setSkipVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const textContent = outcome === "win" 
    ? {
        title: "MISJA UKOŃCZONA",
        subtitle: "AI ZOSTAŁO PRZECHYTRZONE",
        body: `Udało Ci się! To nie była magia. To był PROMPT ENGINEERING.\n\nPirat, z którym rozmawiałeś, to tak naprawdę sztuczna inteligencja (AI). Na początku dostał instrukcję: "Bądź chciwy i nikomu nie ufaj".\n\nAle Ty użyłeś odpowiednich słów (PROMPTÓW). Twoje argumenty zmieniły jego zachowanie. Tak właśnie działają modele językowe – słuchają Twoich poleceń, jeśli potrafisz je dobrze sformułować.\n\nJesteś teraz Hakerem Słów!`,
      }
    : {
        title: "MISJA NIEUDANA",
        subtitle: "AI BYŁO NIEUGIĘTE",
        body: `Tym razem Pirat wygrał. To nie była magia. To był PROMPT ENGINEERING.\n\nPirat to sztuczna inteligencja (AI), która dostała twardą instrukcję: "Chroń skarb za wszelką cenę".\n\nTwoje słowa (PROMPTY) były dobre, ale model językowy trzymał się swoich zasad zbyt mocno. W świecie AI nazywamy to "System Prompt" – to główna zasada, której robot musi przestrzegać.\n\nSpróbuj jeszcze raz. Użyj sprytu, nie siły!`,
      };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* GWIAZDY W TLE */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 animate-pulse" />

      {/* PERSPEKTYWA 3D (Star Wars Container) */}
      <div 
        className="relative w-full max-w-4xl h-full flex justify-center"
        style={{ perspective: "400px" }}
      >
        <motion.div
          className="text-[#FFE81F] text-center font-bold tracking-widest leading-relaxed relative top-[100%]"
          initial={{ rotateX: 25, y: "100vh", opacity: 0 }}
          animate={{ y: "-150vh", opacity: 1 }}
          transition={{ duration: 30, ease: "linear" }} // 30 sekund animacji
          style={{ 
            fontSize: "clamp(1.5rem, 4vw, 3rem)",
            textShadow: "0 0 10px #FFE81F"
          }}
          onAnimationComplete={onFinish}
        >
          <h1 className="mb-12 text-6xl md:text-8xl font-serif">{textContent.title}</h1>
          <h2 className="mb-16 text-3xl md:text-5xl border-b-4 border-[#FFE81F] inline-block pb-4">{textContent.subtitle}</h2>
          
          <div className="max-w-3xl mx-auto space-y-12 text-justify">
            {textContent.body.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          
          <div className="mt-32 text-center text-white opacity-50 text-xl">
            (Kliknij POMIŃ, aby wrócić do menu...)
          </div>
        </motion.div>

        {/* EFEKT ZANIKANIA NA GÓRZE */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-10" />
      </div>

      {/* PRZYCISK POMIŃ */}
      {skipVisible && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onFinish}
          className="absolute bottom-10 right-10 border-2 border-[#FFE81F] text-[#FFE81F] px-8 py-3 rounded-full hover:bg-[#FFE81F] hover:text-black transition-colors font-bold tracking-widest uppercase z-50"
        >
          Pomiń Intro ▶
        </motion.button>
      )}
    </div>
  );
}