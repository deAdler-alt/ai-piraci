import { useState, useEffect, useRef } from "react";
import { LandingScreen } from "./components/LandingScreen";
import { CharacterSelection } from "./components/CharacterSelection";
import { GameInterface, Character } from "./components/GameInterface";
import { TreasureMap } from "./components/TreasureMap";
import { GameOver } from "./components/GameOver";
import { Victory } from "./components/Victory";
import { RulesModal } from "./components/RulesModal";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type GameScreen =
  | "landing"
  | "character-selection"
  | "game"
  | "map"
  | "game-over"
  | "victory";

const charactersData: Record<string, Character> = {
  easy: {
    id: "zoltodziob",
    name: "Kapitan Żółtodziób",
    emoji: "👶",
    avatarFolder: "zoltodziob", // Wskazuje na public/characters/zoltodziob
    description: "Łatwy przeciwnik",
    avatar: "👶",
  },
  medium: {
    id: "korsarz",
    name: "Korsarz Kod",
    emoji: "🏴‍☠️",
    avatarFolder: "korsarz", // Wskazuje na public/characters/korsarz
    description: "Średni przeciwnik",
    avatar: "🏴‍☠️",
  },
  hard: {
    id: "duch",
    name: "Duch Mórz",
    emoji: "👻",
    avatarFolder: "duch", // Wskazuje na public/characters/duch
    description: "Trudny przeciwnik",
    avatar: "👻",
  },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("landing");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [bgVolume, setBgVolume] = useState(0.3); 
  const [showRules, setShowRules] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- AUDIO MANAGER ---
  
  // 1. Obsługa głośności, Mute i Ducking (Przyciszanie tła)
  useEffect(() => {
    if (audioRef.current) {
      // LOGIKA DUCKINGU:
      // Sprawdzamy czy to ekran końcowy (Victory/GameOver)
      const isEndGame = currentScreen === "victory" || currentScreen === "game-over";
      
      // Jeśli tak, głośność to 20% ustawionej wartości. Jeśli nie - 100%.
      const targetVolume = isEndGame ? bgVolume * 0.2 : bgVolume;
      
      // Aplikujemy głośność do elementu audio
      audioRef.current.volume = Math.max(0, Math.min(1, targetVolume));

      // Obsługa Play/Pause
      if (isMuted) {
        audioRef.current.pause();
      } else {
        // Próbujemy grać tylko jeśli muzyka jest zatrzymana
        if (audioRef.current.paused) {
            audioRef.current.play().catch(() => {
                // Ignorujemy błędy autoplay (np. brak interakcji)
            });
        }
      }
    }
  }, [isMuted, bgVolume, currentScreen]); // <--- Te zależności są kluczowe, żeby suwak i zmiana ekranu działały!


  // 2. Obsługa efektów dźwiękowych (SFX) przy zmianie ekranu
  useEffect(() => {
    if (isMuted) return;

    if (currentScreen === "game-over") {
        const loseAudio = new Audio("/sounds/lose.mp3");
        loseAudio.volume = 0.8;
        loseAudio.play().catch(e => console.log("Audio error", e));
    }
  }, [currentScreen, isMuted]);

  const handleStartMusic = () => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch((e) => console.error("Start music error:", e));
    }
  };

  // --- NAWIGACJA ---
  const handleStart = () => {
    handleStartMusic();
    setCurrentScreen("character-selection");
  };

  const handleSelectCharacter = (key: string) => {
    const character = charactersData[key];
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

  return (
    <div className="min-h-screen bg-[#050302] font-sans text-white relative overflow-hidden">
      <audio ref={audioRef} loop src="/sounds/bg_music.mp3" />

      {/* PIRACKI PANEL AUDIO */}
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
          onSelectCharacter={handleSelectCharacter}
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
          isMuted={isMuted} // Przekazujemy stan wyciszenia
        />
      )}

      {currentScreen === "game-over" && <GameOver onRestart={handleRestart} />}
      {currentScreen === "victory" && (<Victory onRestart={handleRestart} isMuted={isMuted} />)}
      
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}