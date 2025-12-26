import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";

interface Character {
  id: string;
  name: string;
  emoji: string;
  avatarFolder: string;
  difficulty: string;
  color: string;
  borderColor: string;
  description: string;
  bounty: string;
  stats: {
    patience: number;
    greed: number;
    cunning: number;
  };
  lore: string[];
}

interface CharacterSelectionProps {
  onSelectCharacter: (characterId: string) => void;
  onBack: () => void;
}

const characters: Character[] = [
  {
    id: "easy",
    name: "Kapitan Żółtodziób",
    emoji: "👶",
    avatarFolder: "zoltodziob",
    difficulty: "Łatwy",
    color: "from-yellow-400 to-orange-500",
    borderColor: "#FFD700",
    description: "Wierzy we wszystko. Marzy o wielkiej przygodzie.",
    bounty: "50 dublonów",
    stats: { patience: 90, greed: 30, cunning: 20 },
    lore: ["..."],
  },
  {
    id: "medium",
    name: "Korsarz Kod",
    emoji: "🏴‍☠️",
    avatarFolder: "korsarz",
    difficulty: "Średni",
    color: "from-orange-600 to-red-700",
    borderColor: "#DC2626",
    description: "Podejrzliwy i chciwy. Szuka haczyków w każdej umowie.",
    bounty: "5,000 dublonów",
    stats: { patience: 50, greed: 80, cunning: 60 },
    lore: ["..."],
  },
  {
    id: "hard",
    name: "Duch Mórz",
    emoji: "👻",
    avatarFolder: "duch",
    difficulty: "Trudny",
    color: "from-emerald-500 to-teal-900",
    borderColor: "#10B981",
    description: "Widmowy logik. Interesują go tylko czyste fakty.",
    bounty: "Niewycenialny",
    stats: { patience: 20, greed: 0, cunning: 100 },
    lore: ["..."],
  },
];

export function CharacterSelection({
  onSelectCharacter,
  onBack,
}: CharacterSelectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen relative bg-[#2a1b12] p-4 md:p-8 overflow-x-hidden flex flex-col">
      {/* Tło */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none fixed"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 49px, #000 50px)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none fixed" />

      {/* Przycisk Wróć */}
      <motion.button
        onClick={onBack}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 bg-[#5d4037] text-[#deb887] border-2 border-[#3e2723] px-6 py-3 rounded-xl shadow-xl hover:bg-[#4e342e] transition-colors"
      >
        <ArrowLeft size={28} />
        <span style={{ fontFamily: "'Pirata One', cursive", fontSize: "1.5rem" }}>Wróć</span>
      </motion.button>

      {/* Nagłówek */}
      <div className="relative z-10 mt-16 mb-12 text-center">
        <h1
          className="mb-4"
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "clamp(3rem, 7vw, 5rem)", // GIGANTYCZNY NAGŁÓWEK
            color: "#f5deb3",
            textShadow: "4px 4px 0px #3e2723",
          }}
        >
          Wybierz Przeciwnika
        </h1>
      </div>

      {/* Grid Kart - Wersja GIGANT */}
      <div className="flex-1 max-w-[1800px] mx-auto w-full flex items-center justify-center pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full px-4">
          {characters.map((character) => {
            const isSelected = selectedId === character.id;

            return (
              <motion.div
                key={character.id}
                onClick={() => setSelectedId(isSelected ? null : character.id)}
                className={`
                  relative cursor-pointer rounded-[3rem] p-8 md:p-10 flex flex-col items-center text-center transition-all duration-300
                  ${isSelected ? "bg-[#3e2723] scale-105 z-20" : "bg-[#2a1b12] hover:bg-[#322319] hover:-translate-y-2"}
                `}
                style={{
                  border: isSelected ? `6px solid ${character.borderColor}` : "6px solid #4a3b32", // Grubasne ramki
                  boxShadow: isSelected ? `0 0 60px ${character.borderColor}60` : "0 20px 40px rgba(0,0,0,0.6)",
                  filter: selectedId && !isSelected ? "grayscale(100%) opacity(0.4) blur(2px)" : "grayscale(0%)",
                }}
                layout
              >
                {/* Avatar - WERSJA GIGANT */}
                <div 
                  className="w-60 h-60 md:w-80 md:h-80 rounded-full border-[6px] bg-[#1a1a1a] shadow-inner overflow-hidden mb-8 relative"
                  style={{ borderColor: isSelected ? character.borderColor : "#5d4037" }}
                >
                   <img 
                      src={`/characters/${character.avatarFolder}/idle.png`}
                      alt={character.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                  />
                  <span className="text-8xl hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{character.emoji}</span>
                </div>

                {/* Nazwa */}
                <h2
                  className="text-4xl md:text-5xl mb-4"
                  style={{ fontFamily: "'Pirata One', cursive", color: isSelected ? "#f5deb3" : "#a1887f" }}
                >
                  {character.name}
                </h2>
                
                {/* Trudność */}
                <span
                  className="px-6 py-2 rounded-full text-xl font-bold border-2 shadow-md bg-[#2a1b12] mb-6"
                  style={{ color: character.borderColor, borderColor: character.borderColor }}
                >
                  {character.difficulty}
                </span>

                {/* Opis - Większy font */}
                <p className="text-[#d7ccc8] font-serif text-xl italic opacity-80 leading-relaxed min-h-[4rem]">
                  "{character.description}"
                </p>

                {/* Przycisk START */}
                <div className="h-24 w-full mt-6 flex items-center justify-center">
                    <AnimatePresence>
                        {isSelected && (
                        <motion.button
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectCharacter(character.id);
                            }}
                            className={`
                                w-full py-4 px-8 rounded-2xl font-bold text-white shadow-[0_0_30px_rgba(0,0,0,0.5)]
                                bg-gradient-to-r ${character.color}
                            `}
                            style={{
                                fontFamily: "'Pirata One', cursive",
                                fontSize: "2rem", // GIGANTYCZNY PRZYCISK
                                letterSpacing: "2px",
                                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                            }}
                        >
                            ⚔️ WYBIERAM!
                        </motion.button>
                        )}
                    </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}