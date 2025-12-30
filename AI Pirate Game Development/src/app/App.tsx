import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Volume2, VolumeX } from "lucide-react";

// --- CORE & TYPES ---
import { Character } from "../core/types";

// --- ADMIN PANEL ---
import { AdminPanel } from "../app/components/AdminPanel";

// --- COMPONENTS ---
import { LandingScreen } from "./components/LandingScreen";
import { CharacterSelection } from "./components/CharacterSelection";
import { GameInterface } from "./components/GameInterface";
import { TreasureMap } from "./components/TreasureMap";
import { GameOver } from "./components/GameOver";
import { Victory } from "./components/Victory";
import { RulesModal } from "./components/RulesModal";

import { useInactivity } from "./hooks/useInactivity";

// --- TYPES ---
type GameScreen =
  | "landing"
  | "character-selection"
  | "GameInterface"
  | "game"
  | "map"
  | "game-over"
  | "victory";

export default function App() {
  // --- STATE ---
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("landing");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  // Audio State
  const [isMuted, setIsMuted] = useState(false);
  const [bgVolume, setBgVolume] = useState(0.1); 
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  //panel admin
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
  // 🎵 AUDIO MANAGER
  // =================================================================

  // 1. Obsługa Głośności, Mute i "Ducking" (Przyciszanie tła)
  useEffect(() => {
    if (audioRef.current) {
      // Lista ekranów, na których muzyka ma być tłem (cicha)
      const isQuietScreen = ["GameInterface","map", "victory", "game-over"].includes(currentScreen);
      
      // Modifier: 100% normalnie, 20% na ekranach końcowych/mapie
      const volumeModifier = isQuietScreen ? 0.2 : 1.0;
      const targetVolume = bgVolume * volumeModifier;
      
      audioRef.current.volume = Math.max(0, Math.min(1, targetVolume));

      if (isMuted) {
        audioRef.current.pause();
      } else if (audioRef.current.paused) {
        audioRef.current.play().catch(() => { /* Autoplay block ignore */ });
      }
    }
  }, [isMuted, bgVolume, currentScreen]);

  // 2. Obsługa SFX przy zmianie ekranu (np. Game Over)
  useEffect(() => {
    if (isMuted) return;

    if (currentScreen === "game-over") {
        const loseAudio = new Audio("/sounds/lose.mp3");
        loseAudio.volume = 0.8;
        loseAudio.play().catch((e) => console.warn("Audio error", e));
    }
  }, [currentScreen, isMuted]);

  const handleStartMusic = () => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch((e) => console.error("Start music error:", e));
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

  const handleGameWon = () => setCurrentScreen("map");
  const handleMapComplete = () => setCurrentScreen("victory");
  const handleGameOver = () => setCurrentScreen("game-over");
  
  const handleRestart = () => {
    setCurrentScreen("landing");
    setSelectedCharacter(null);
  };
  
  const handleBackToGame = () => setCurrentScreen("landing");

  // =================================================================
  // 🖥️ RENDER
  // =================================================================
  return (
    <div className="min-h-screen bg-[#050302] font-sans text-white relative overflow-hidden">
      {/* GLOBAL AUDIO PLAYER */}
      <audio ref={audioRef} loop src="/sounds/bg_music.mp3" />

      {/* --- PIRACKI PANEL AUDIO (PRAWY DÓŁ) --- */}
      <div 
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-2"
        onMouseEnter={() => setShowVolumeSlider(true)}
        onMouseLeave={() => setShowVolumeSlider(false)}
      >
        <AnimatePresence>
            {showVolumeSlider && (
                <motion.div 
                    initial={{ width: 0, opacity: 0, x: 20 }}
                    animate={{ width: "auto", opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: 20 }}
                    className="overflow-hidden"
                >
                    <div 
                        className="flex items-center px-4 py-2 rounded-l-lg border-y-2 border-l-2 border-[#FFD700] shadow-xl mr-[-10px] pr-6"
                        style={{
                            backgroundColor: "#5d4037",
                            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.2) 5px)",
                        }}
                    >
                        <input 
                            type="range" 
                            min="0" max="1" step="0.05" 
                            value={bgVolume} 
                            onChange={(e) => {
                                setBgVolume(parseFloat(e.target.value));
                                if (isMuted && parseFloat(e.target.value) > 0) setIsMuted(false);
                            }}
                            className="w-24 h-2 rounded-lg appearance-none cursor-pointer bg-[#2a1b12] shadow-inner accent-[#FFD700]"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <motion.button 
            onClick={() => setIsMuted(!isMuted)} 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-14 h-14 rounded-full border-4 shadow-[0_4px_10px_rgba(0,0,0,0.6)] flex items-center justify-center z-20 overflow-hidden"
            style={{
                backgroundColor: isMuted ? "#7f1d1d" : "#5d4037",
                borderColor: "#FFD700",
            }}
        >
             <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 7px)",
                }}
            />
            <div className="relative z-10 text-[#FFD700] drop-shadow-md">
                {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
            </div>
        </motion.button>
      </div>

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
          onDirectVictory={handleMapComplete}
          onGameOver={handleGameOver}
          isMuted={isMuted}
        />
      )}

      {currentScreen === "map" && (
        <TreasureMap
          onComplete={handleMapComplete}
          onBack={handleBackToGame}
          isMuted={isMuted}
        />
      )}

      {currentScreen === "game-over" && (
        <GameOver onRestart={handleRestart} />
      )}
      
      {currentScreen === "victory" && (
        <Victory onRestart={handleRestart} isMuted={isMuted} />
      )}
      
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}