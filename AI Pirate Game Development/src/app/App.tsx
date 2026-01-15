import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

// --- CORE & TYPES ---
import { Character } from "../core/types";

// --- ADMIN PANEL ---
import { AdminPanel } from "../app/components/AdminPanel";

// --- COMPONENTS ---
import { LandingScreen } from "./components/LandingScreen";
import { CharacterSelection } from "./components/CharacterSelection";
import { GameInterface } from "./components/GameInterface";
import { GameOver } from "./components/GameOver";
import { Victory } from "./components/Victory";
import { RulesModal } from "./components/RulesModal";
import { EducationalOutro } from "./components/EducationalOutro";

import { useInactivity } from "./hooks/useInactivity";

// --- TYPES ---
type GameScreen =
  | "landing"
  | "character-selection"
  | "game"
  | "game-over"
  | "victory"
  | "educational-outro";

export default function App() {
  // --- STATE ---
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("landing");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [gameOutcome, setGameOutcome] = useState<"win" | "loss">("win");
  
  // Audio State
  const [isMuted, setIsMuted] = useState(false);
  const [bgVolume, setBgVolume] = useState(0.1); 
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Panel admin
  const path = window.location.pathname;
  if (path === "/admin") {
    return <AdminPanel />;
  }

  useInactivity(90000, () => {
    if (window.location.pathname !== "/") {
        window.location.href = "/";
    }
  });



  // =================================================================
  // 🛠️ DEV ROUTER - TYLKO DO TESTÓW LOKALNYCH

// http://localhost:5173/victory -> Od razu widzisz ekran wygranej (skrzynia, monety).

// http://localhost:5173/game-over -> Widzisz ekran przegranej (kłódki).

// http://localhost:5173/educational-outro -> Widzisz napisy końcowe Star Wars.

// http://localhost:5173/ -> Standardowy start (Landing Page).

  useEffect(() => {
    // Pobieramy to co jest po slashu, np. "victory" z "localhost:5173/victory"
    const path = window.location.pathname.replace("/", "");

    if (path === "victory") {
        setGameOutcome("win"); // Ustawiamy wynik na wygraną (dla Outro)
        setCurrentScreen("victory");
    } 
    else if (path === "game-over") {
        setGameOutcome("loss"); // Ustawiamy wynik na przegraną
        setCurrentScreen("game-over");
    } 
    else if (path === "educational-outro") {
        setGameOutcome("win"); // Domyślnie pokazujemy wersję WIN
        setCurrentScreen("educational-outro");
    }
    // Jeśli chcesz testować grę bez wybierania postaci (Mock Character)
    else if (path === "game") {
        setSelectedCharacter({
            id: "mock-pirate",
            name: "Testowy Pirat",
            description: "To jest pirat testowy.",
            difficulty: "easy",
        });
        setCurrentScreen("game");
    }
  }, []);
  
  // =================================================================




  // =================================================================
  // 🎵 AUDIO MANAGER
  // =================================================================
  useEffect(() => {
    if (audioRef.current) {
      const isQuietScreen = ["game", "victory", "game-over", "educational-outro"].includes(currentScreen);
      const volumeModifier = isQuietScreen ? 0.2 : 1.0;
      audioRef.current.volume = Math.max(0, Math.min(1, bgVolume * volumeModifier));

      if (isMuted) audioRef.current.pause();
      else if (audioRef.current.paused) audioRef.current.play().catch(() => {});
    }
  }, [isMuted, bgVolume, currentScreen]);

  useEffect(() => {
    if (isMuted) return;
    if (currentScreen === "game-over") {
        new Audio("/sounds/lose.mp3").play().catch(console.warn);
    } else if (currentScreen === "victory") {
        new Audio("/sounds/win.mp3").play().catch(console.warn); // Opcjonalnie, jeśli masz win.mp3
    }
  }, [currentScreen, isMuted]);

  const handleStartMusic = () => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(console.error);
    }
  };

  // =================================================================
  // 🧭 NAWIGACJA
  // =================================================================

  const handleStart = () => {
    handleStartMusic();
    setCurrentScreen("character-selection");
  };

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setCurrentScreen("game");
  };

  const handleGameWon = () => {
      setGameOutcome("win");
      setCurrentScreen("victory");
  };
  
  const handleGameOver = () => {
      setGameOutcome("loss");
      setCurrentScreen("game-over");
  };
  
  const handleProceedToOutro = () => {
    setCurrentScreen("educational-outro");
  };

  const handleBackToMenu = () => {
    setCurrentScreen("landing");
    setSelectedCharacter(null);
  };


  // =================================================================
  // 🖥️ RENDER
  // =================================================================
  return (
    <div className="min-h-screen bg-[#050302] font-sans text-white relative overflow-hidden">
      <audio ref={audioRef} loop src="/sounds/bg_music.mp3" />

      {/* --- AUDIO CONTROLS --- */}
      {currentScreen !== "educational-outro" && (
        <div 
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-2"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
        >
            <AnimatePresence>
                {showVolumeSlider && (
                    <motion.div initial={{ width: 0, opacity: 0, x: 20 }} animate={{ width: "auto", opacity: 1, x: 0 }} exit={{ width: 0, opacity: 0, x: 20 }} className="overflow-hidden">
                        <div className="flex items-center px-4 py-2 rounded-l-lg border-y-2 border-l-2 border-[#FFD700] shadow-xl mr-[-10px] pr-6" style={{ backgroundColor: "#5d4037" }}>
                            <input type="range" min="0" max="1" step="0.05" value={bgVolume} onChange={(e) => { setBgVolume(parseFloat(e.target.value)); if (isMuted && parseFloat(e.target.value) > 0) setIsMuted(false); }} className="w-24 h-2 rounded-lg appearance-none cursor-pointer bg-[#2a1b12] accent-[#FFD700]" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button onClick={() => setIsMuted(!isMuted)} whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }} className="relative w-14 h-14 rounded-full border-4 shadow-xl flex items-center justify-center z-20 overflow-hidden" style={{ backgroundColor: isMuted ? "#7f1d1d" : "#5d4037", borderColor: "#FFD700" }}>
                <div className="relative z-10 text-[#FFD700]">{isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}</div>
            </motion.button>
        </div>
      )}

      {/* --- EKRANY GRY --- */}

      {currentScreen === "landing" && (
        <LandingScreen
          onStart={handleStart}
          onRules={() => setShowRules(true)}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
        />
      )}

      {currentScreen === "character-selection" && (
        <CharacterSelection
          onSelect={handleSelectCharacter} 
          onBack={() => setCurrentScreen("landing")}
        />
      )}

      {currentScreen === "game" && selectedCharacter && (
        <GameInterface
          selectedCharacter={selectedCharacter}
          onVictory={handleGameWon}
          onGameOver={handleGameOver}
        />
      )}

      {currentScreen === "game-over" && (
        <GameOver onRestart={handleProceedToOutro} />
      )}
      
      {currentScreen === "victory" && (
        <Victory onRestart={handleProceedToOutro} isMuted={isMuted} />
      )}

      {currentScreen === "educational-outro" && (
          <EducationalOutro 
            outcome={gameOutcome} 
            onFinish={handleBackToMenu} 
          />
      )}
      
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}

