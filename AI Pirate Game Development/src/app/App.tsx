import { useState } from "react";
import { LandingScreen } from "./components/LandingScreen";
import { CharacterSelection } from "./components/CharacterSelection";
import { GameInterface, Character } from "./components/GameInterface"; // Importujemy typ Character z GameInterface
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

// DANE POSTACI - Muszą pasować ID do tego, co ustawiliśmy w SERVER/INDEX.JS
// Backend oczekuje: 'zoltodziob', 'korsarz', 'duch'
const charactersData: Record<string, Character> = {
  easy: {
    id: "zoltodziob", // To ID leci do backendu
    name: "Kapitan Żółtodziób",
    role: "Leniwy strażnik",
    description: "Łatwo go przekupić jedzeniem lub rumem.",
    difficulty: "easy",
    avatar: "👶",
  },
  medium: {
    id: "korsarz",
    name: "Korsarz Kod",
    role: "Groźny kapitan",
    description: "Szanuje tylko siłę i odwagę.",
    difficulty: "medium",
    avatar: "🏴‍☠️",
  },
  hard: {
    id: "duch",
    name: "Duch Mórz",
    role: "Widmo",
    description: "Mówi zagadkami, bardzo niecierpliwy.",
    difficulty: "hard",
    avatar: "👻",
  },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("landing");
  
  // Przechowujemy pełny obiekt wybranej postaci
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // --- NAWIGACJA ---

  const handleStart = () => {
    setCurrentScreen("character-selection");
  };

  const handleSelectCharacter = (key: string) => {
    // 'key' to np. 'easy', 'medium', 'hard' z komponentu wyboru
    const character = charactersData[key];
    setSelectedCharacter(character);
    setCurrentScreen("game");
  };

  // Kiedy gracz przekona pirata (Backend zwraca isVictory: true)
  // Przechodzimy do MAPY, a nie od razu do zwycięstwa
  const handleGameWon = () => {
    setCurrentScreen("map");
  };

  // Kiedy gracz przejdzie mapę
  const handleMapComplete = () => {
    setCurrentScreen("victory");
  };

  // Kiedy gracz przegra rozmowę
  const handleGameOver = () => {
    setCurrentScreen("game-over");
  };

  const handleRestart = () => {
    setCurrentScreen("landing");
    setSelectedCharacter(null);
  };

  // Opcjonalne: Powrót z mapy do gry (jeśli chcesz taką opcję, 
  // chociaż logicznie po wygranej rozmowie nie powinno się wracać)
  const handleBackToGame = () => {
    // W tej wersji po wygranej rozmowie idziemy na mapę. 
    // Cofnięcie z mapy mogłoby ewentualnie wracać do menu głównego.
    setCurrentScreen("landing"); 
  };

  return (
    <div className="min-h-screen bg-[#050302] font-sans text-white">
      {/* 1. EKRAN STARTOWY */}
      {currentScreen === "landing" && (
        <LandingScreen
          onStart={handleStart}
          onRules={() => setShowRules(true)}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
        />
      )}

      {/* 2. WYBÓR POSTACI */}
      {currentScreen === "character-selection" && (
        <CharacterSelection
          onSelectCharacter={handleSelectCharacter}
          onBack={() => setCurrentScreen("landing")}
        />
      )}

      {/* 3. ROZMOWA Z PIRATEM (GAME INTERFACE) */}
      {currentScreen === "game" && selectedCharacter && (
        <GameInterface
          selectedCharacter={selectedCharacter}
          onVictory={handleGameWon} // Sukces -> idziemy na Mapę
          onGameOver={handleGameOver} // Porażka -> Game Over
          isMuted={isMuted}
        />
      )}

      {/* 4. MAPA SKARBÓW */}
      {currentScreen === "map" && (
        <TreasureMap
          onComplete={handleMapComplete} // Koniec mapy -> Victory
          onBack={handleBackToGame}
        />
      )}

      {/* 5. GAME OVER */}
      {currentScreen === "game-over" && (
        <GameOver onRestart={handleRestart} />
      )}

      {/* 6. ZWYCIĘSTWO */}
      {currentScreen === "victory" && (
        <Victory onRestart={handleRestart} />
      )}

      {/* MODAL Z ZASADAMI */}
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />
    </div>
  );
}