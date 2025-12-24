import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Skull, Coins, Brain } from "lucide-react";

interface Character {
  id: string;
  name: string;
  emoji: string;
  difficulty: string;
  color: string;
  borderColor: string;
  description: string;
  // Nowe pola
  bounty: string;
  stats: {
    patience: number; // 0-100
    greed: number; // 0-100
    cunning: number; // 0-100
  };
  lore: string[]; // Lista ciekawostek do losowania
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
    difficulty: "Łatwy",
    color: "from-yellow-400 to-orange-500",
    borderColor: "#FFD700",
    description:
      "Wierzy we wszystko, co usłyszy. Marzy o wielkiej przygodzie.",
    bounty: "50 dublonów",
    stats: {
      patience: 90, // Bardzo cierpliwy
      greed: 30, // Mało chciwy
      cunning: 20, // Mało sprytny
    },
    lore: [
      "Kiedyś pomylił papugę z kurczakiem i próbował ją zjeść.",
      "Jego 'statek' to tak naprawdę duża balia z żaglem z prześcieradła.",
      "Boi się wody, dlatego zawsze nosi koło ratunkowe.",
    ],
  },
  {
    id: "medium",
    name: "Korsarz Kod",
    emoji: "🏴‍☠️",
    difficulty: "Średni",
    color: "from-orange-600 to-red-700",
    borderColor: "#DC2626",
    description:
      "Podejrzliwy i chciwy. Szuka haczyków w każdej umowie.",
    bounty: "5,000 dublonów",
    stats: {
      patience: 50,
      greed: 80,
      cunning: 60,
    },
    lore: [
      "Stracił oko grając w karty z rekinem.",
      "Mówi płynnie w JavaScripcie, ale nikogo to nie obchodzi.",
      "Zakopał skarb, ale zapomniał na której wyspie.",
    ],
  },
  {
    id: "hard",
    name: "Duch Mórz",
    emoji: "👻",
    difficulty: "Trudny",
    color: "from-emerald-500 to-teal-900",
    borderColor: "#10B981",
    description:
      "Widmowy logik. Nie obchodzą go skarby, tylko czyste fakty.",
    bounty: "Niewycenialny",
    stats: {
      patience: 20, // Bardzo szybko się denerwuje
      greed: 0, // Nieprzekupny
      cunning: 100, // Geniusz
    },
    lore: [
      "Niektórzy mówią, że to AI, które zyskało samoświadomość w 1700 roku.",
      "Przechodzi przez ściany, ale nie potrafi przejść testu Turinga.",
      "Jego statek widnieje tylko we mgle i w błędach kompilacji.",
    ],
  },
];

export function CharacterSelection({
  onSelectCharacter,
  onBack,
}: CharacterSelectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    null,
  );
  // Stan do trzymania wylosowanego indeksu ciekawostki dla każdej postaci
  // Używamy prostej sztuczki: (długość nazwy + dzień miesiąca) % ilość ciekawostek, żeby było "losowo" ale stabilnie
  // lub po prostu bierzemy pierwszą dla uproszczenia, tu zrobimy losowanie przy renderze (wystarczające dla zabawy)

  return (
    <div className="min-h-screen relative bg-[#2a1b12] p-4 md:p-8 overflow-x-hidden overflow-y-auto">
      {/* Tło */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none fixed"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 49px, #000 50px)",
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
        className="fixed top-6 left-6 z-50 flex items-center gap-2 bg-[#5d4037] text-[#deb887] border-2 border-[#3e2723] px-4 py-2 rounded-lg shadow-xl hover:bg-[#4e342e] transition-colors"
      >
        <ArrowLeft size={20} />
        <span
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "1.2rem",
          }}
        >
          Wróć
        </span>
      </motion.button>

      <div className="max-w-6xl mx-auto relative z-10 mt-20 md:mt-10 pb-20">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1
            className="mb-2"
            style={{
              fontFamily: "'Pirata One', cursive",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              color: "#f5deb3",
              textShadow: "3px 3px 0px #3e2723",
            }}
          >
            Wybierz Przeciwnika
          </h1>
          <p className="text-[#d7ccc8] text-lg font-serif italic opacity-80">
            Kliknij kartę, aby poznać sekrety pirata...
          </p>
        </motion.div>

        {/* Grid Kart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {characters.map((character) => {
            const isSelected = selectedId === character.id;

            return (
              <motion.div
                key={character.id}
                layout // TO KLUCZ DO ANIMACJI ROZWIJANIA
                onClick={() =>
                  setSelectedId(
                    isSelected ? null : character.id,
                  )
                } // Kliknięcie ponowne zwija kartę
                className="relative cursor-pointer group"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  layout
                  className={`
                    relative rounded-[2rem] p-6 flex flex-col items-center text-center overflow-hidden
                    ${isSelected ? "bg-[#3e2723]" : "bg-[#2a1b12]"}
                  `}
                  style={{
                    border: isSelected
                      ? `4px solid ${character.borderColor}`
                      : "4px solid #4a3b32",
                    boxShadow: isSelected
                      ? `0 0 30px ${character.borderColor}40`
                      : "0 10px 20px rgba(0,0,0,0.5)",
                    filter: isSelected
                      ? "grayscale(0%)"
                      : "grayscale(80%) sepia(20%)",
                  }}
                  whileHover={{
                    y: isSelected ? 0 : -10, // Nie podskakuj jak rozwinięta
                    filter: "grayscale(0%)",
                  }}
                >
                  {/* Nagłówek Karty (zawsze widoczny) */}
                  <motion.div
                    layout
                    className="relative z-10 flex flex-col items-center w-full"
                  >
                    <div className="relative mb-4">
                      <motion.div
                        layout
                        className="w-24 h-24 rounded-full border-4 flex items-center justify-center bg-[#1a1a1a] shadow-inner"
                        style={{
                          borderColor: isSelected
                            ? character.borderColor
                            : "#5d4037",
                        }}
                      >
                        <span className="text-5xl">
                          {character.emoji}
                        </span>
                      </motion.div>

                      {/* Badge Trudności */}
                      <motion.div
                        layout
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap"
                      >
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold border shadow-md bg-[#2a1b12]"
                          style={{
                            color: character.borderColor,
                            borderColor: character.borderColor,
                          }}
                        >
                          {character.difficulty}
                        </span>
                      </motion.div>
                    </div>

                    <motion.h2
                      layout
                      className="text-2xl mb-2"
                      style={{
                        fontFamily: "'Pirata One', cursive",
                        color: isSelected
                          ? "#f5deb3"
                          : "#a1887f",
                      }}
                    >
                      {character.name}
                    </motion.h2>
                  </motion.div>

                  {/* ROZWIJANA ZAWARTOŚĆ */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                      >
                        {/* Separator */}
                        <div className="w-full h-px bg-[#5d4037] my-4" />

                        {/* 1. Nagroda */}
                        <div className="mb-6 bg-[#2a1b12]/50 p-2 rounded-lg border border-[#5d4037] flex items-center justify-center gap-2">
                          <span className="font-bold text-[rgb(255,196,80)] font-serif">
                            💰 Nagroda:
                          </span>
                          <span className="font-bold text-[#f5deb3] font-serif">
                            {character.bounty}
                          </span>
                        </div>

                        {/* 2. Statystyki */}
                        <div className="space-y-3 mb-6 w-full text-sm">
                          <StatBar
                            label="Cierpliwość"
                            value={character.stats.patience}
                            color="bg-blue-500"
                            icon={<Brain size={14} />}
                          />
                          <StatBar
                            label="Chciwość"
                            value={character.stats.greed}
                            color="bg-yellow-500"
                            icon={<Coins size={14} />}
                          />
                          <StatBar
                            label="Spryt"
                            value={character.stats.cunning}
                            color="bg-red-500"
                            icon={<Skull size={14} />}
                          />
                        </div>

                        {/* 3. Lore (Na kawałku papieru) */}
                        <div className="relative p-4 bg-[#f5deb3] text-[#3e2723] rounded-sm shadow-inner mb-6 transform rotate-1">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-4 h-4 rounded-full bg-[#3e2723] opacity-20" />{" "}
                          {/* "Gwóźdź" */}
                          <h4
                            style={{
                              fontFamily:
                                "'Pirata One', cursive",
                            }}
                            className="text-lg mb-1 opacity-80"
                          >
                            Legenda głosi:
                          </h4>
                          <p className="italic text-sm leading-snug">
                            "
                            {
                              character.lore[
                                Math.floor(
                                  Math.random() *
                                    character.lore.length,
                                )
                              ]
                            }
                            "
                          </p>
                        </div>

                        {/* Przycisk START */}
                        <motion.button
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCharacter(character.id);
                          }}
                          className={`
                            w-full py-3 px-6 rounded-xl font-bold text-white shadow-lg mt-2
                            bg-gradient-to-r ${character.color}
                          `}
                          style={{
                            fontFamily: "'Pirata One', cursive",
                            fontSize: "1.4rem",
                            letterSpacing: "1px",
                            textShadow:
                              "1px 1px 2px rgba(0,0,0,0.5)",
                          }}
                        >
                          ⚔️ DO BOJU!
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Podpowiedź dla niewybranych */}
                  {!isSelected && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[#5d4037] text-xs italic mt-4"
                    >
                      Kliknij, aby rozwinąć
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Komponent pomocniczy do pasków statystyk
function StatBar({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: any;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[#a1887f] text-xs uppercase font-bold tracking-wider">
        <span className="flex items-center gap-1">
          {icon} {label}
        </span>
        <span>{value}%</span>
      </div>
      <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden border border-[#3e2723]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}