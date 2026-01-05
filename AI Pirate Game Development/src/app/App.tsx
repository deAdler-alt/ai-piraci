import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Character } from "../core/types";
import { AdminPanel } from "../app/components/AdminPanel";
import { LandingScreen } from "./components/LandingScreen";
import { CharacterSelection } from "./components/CharacterSelection";
import { GameInterface } from "./components/GameInterface";
// import { TreasureMap } from "./components/TreasureMap"; // <--- USUNIĘTE
import { GameOver } from "./components/GameOver";
import { Victory } from "./components/Victory";
import { RulesModal } from "./components/RulesModal";
import { useInactivity } from "./hooks/useInactivity";

type GameScreen = "landing" | "character-selection" | "game" | "game-over" | "victory";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("landing");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [bgVolume, setBgVolume] = useState(0.1); 
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const path = window.location.pathname;
  if (path === "/admin") return <AdminPanel />;

  useInactivity(90000, () => {
    if (window.location.pathname !== "/") window.location.href = "/";
  });

  useEffect(() => {
    if (audioRef.current) {
      const isQuietScreen = ["game", "victory", "game-over"].includes(currentScreen);
      audioRef.current.volume = Math.max(0, Math.min(1, bgVolume * (isQuietScreen ? 0.2 : 1.0)));
      if (isMuted) audioRef.current.pause();
      else if (audioRef.current.paused) audioRef.current.play().catch(() => {});
    }
  }, [isMuted, bgVolume, currentScreen]);

  useEffect(() => {
    if (isMuted) return;
    if (currentScreen === "game-over") new Audio("/sounds/lose.mp3").play().catch(console.warn);
  }, [currentScreen, isMuted]);

  const handleStart = () => {
    if (audioRef.current && !isMuted) audioRef.current.play().catch(console.error);
    setCurrentScreen("character-selection");
  };

  // --- ROUTING BEZ MAPY ---
  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setCurrentScreen("game");
  };
  const handleGameWon = () => setCurrentScreen("victory"); // PROSTO DO ZWYCIĘSTWA
  const handleGameOver = () => setCurrentScreen("game-over");
  const handleRestart = () => { setCurrentScreen("landing"); setSelectedCharacter(null); };

  return (
    <div className="min-h-screen bg-[#050302] font-sans text-white relative overflow-hidden">
      <audio ref={audioRef} loop src="/sounds/bg_music.mp3" />

      {/* Kontrolki Audio */}
      <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
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

      {/* --- EKRANY --- */}
      {currentScreen === "landing" && <LandingScreen onStart={handleStart} onRules={() => setShowRules(true)} isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />}
      {currentScreen === "character-selection" && <CharacterSelection onSelect={handleSelectCharacter} onBack={() => setCurrentScreen("landing")} />}
      {currentScreen === "game" && selectedCharacter && <GameInterface selectedCharacter={selectedCharacter} onVictory={handleGameWon} onGameOver={handleGameOver} />}
      {currentScreen === "game-over" && <GameOver onRestart={handleRestart} />}
      {currentScreen === "victory" && <Victory onRestart={handleRestart} isMuted={isMuted} />}
      
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}