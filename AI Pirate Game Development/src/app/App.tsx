import { useState } from "react";
import { LandingScreen } from "./components/LandingScreen";
import { CharacterSelection } from "./components/CharacterSelection";
import { GameInterface } from "./components/GameInterface";
import { TreasureMap } from "./components/TreasureMap";
import { GameOver } from "./components/GameOver";
import { Victory } from "./components/Victory";
import { RulesModal } from "./components/RulesModal";

type GameScreen =
  | "landing"
  | "character-selection"
  | "game"
  | "map"
  | "game-over"
  | "victory";

interface Character {
  id: string;
  name: string;
  emoji: string;
  // Dodajemy statystyki do definicji w App.tsx
  stats: {
    patience: number;
  };
}

// Definicja postaci z poprawnymi statystykami (zgodnie z CharacterSelection)
const characters: Record<string, Character> = {
  easy: {
    id: "easy",
    name: "Kapitan Żółtodziób",
    emoji: "👶🏴‍☠️",
    stats: { patience: 90 },
  },
  medium: {
    id: "medium",
    name: "Korsarz Kod",
    emoji: "🏴‍☠️",
    stats: { patience: 50 },
  },
  hard: {
    id: "hard",
    name: "Duch Mórz",
    emoji: "👻🏴‍☠️",
    stats: { patience: 20 },
  },
};

export default function App() {
  const [currentScreen, setCurrentScreen] =
    useState<GameScreen>("landing");
  const [selectedCharacter, setSelectedCharacter] =
    useState<Character | null>(null);
  const [patience, setPatience] = useState(100);
  const [isMapUnlocked, setIsMapUnlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const handleStart = () => {
    setCurrentScreen("character-selection");
  };

  const handleSelectCharacter = (characterId: string) => {
    const character = characters[characterId];
    setSelectedCharacter(character);
    setPatience(character.stats.patience);
    setIsMapUnlocked(false);
    setCurrentScreen("game");
  };

  const handleUnlockMap = () => {
    setIsMapUnlocked(true);
    setCurrentScreen("map");
  };

  const handleMapComplete = () => {
    setCurrentScreen("victory");
  };

  const handleWin = () => {
    setCurrentScreen("victory");
  };

  const handleGameOver = () => {
    setCurrentScreen("game-over");
  };

  const handleRestart = () => {
    setCurrentScreen("landing");
    setSelectedCharacter(null);
    setPatience(100);
    setIsMapUnlocked(false);
  };

  const handleBackToGame = () => {
    setCurrentScreen("game");
  };

  return (
    <div className="min-h-screen">
      {currentScreen === "landing" && (
        <LandingScreen
          onStart={handleStart}
          onRules={() => setShowRules(true)}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
        />
      )}

      {/* Przekazujemy onBack do CharacterSelection (dodaliśmy to w poprzednim kroku) */}
      {currentScreen === "character-selection" && (
        <CharacterSelection
          onSelectCharacter={handleSelectCharacter}
          onBack={() => setCurrentScreen("landing")}
        />
      )}

      {currentScreen === "game" && selectedCharacter && (
        <GameInterface
          character={selectedCharacter}
          patience={patience}
          onPatience={setPatience}
          onUnlockMap={handleUnlockMap}
          onWin={handleWin}
          onGameOver={handleGameOver}
          isMapUnlocked={isMapUnlocked}
        />
      )}

      {currentScreen === "map" && (
        <TreasureMap
          onComplete={handleMapComplete}
          onBack={handleBackToGame}
        />
      )}

      {currentScreen === "game-over" && (
        <GameOver onRestart={handleRestart} />
      )}

      {currentScreen === "victory" && (
        <Victory onRestart={handleRestart} />
      )}

      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />
    </div>
  );
}