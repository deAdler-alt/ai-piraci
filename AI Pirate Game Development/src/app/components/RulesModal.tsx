import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Tło przyciemniające) - bez zmian, delikatny fade */}
          <motion.div
            className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Modal - ZMIANA ANIMACJI TUTAJ */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            // ZAMIAST: scale: 0, rotate: -180 (Eksplozja)
            // DAJEMY: Spokojne wynurzenie
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            // Płynne przejście bez "sprężynowania"
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="bg-gradient-to-br from-[#FFF8E1] to-[#F4E4C1] border-4 border-[#8B4513] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
              {/* Przycisk zamknięcia */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors z-10"
              >
                <X size={24} />
              </button>

              {/* Zawartość */}
              <div className="p-8">
                {/* Nagłówek */}
                <h2
                  className="text-center mb-6"
                  style={{
                    fontFamily: "'Pirata One', cursive",
                    fontSize: 'clamp(2rem, 6vw, 3rem)',
                    color: '#8B4513',
                    textShadow: '3px 3px 0px #FFD700'
                  }}
                >
                  📜 ZASADY GRY 📜
                </h2>

                {/* Sekcje zasad */}
                <div className="space-y-6">
                  {/* Cel gry */}
                  <div className="bg-white/80 rounded-2xl p-6 border-2 border-[#8B4513] shadow-lg">
                    <h3
                      className="mb-3"
                      style={{
                        fontFamily: "'Pirata One', cursive",
                        fontSize: '1.5rem',
                        color: '#F97316'
                      }}
                    >
                      🎯 CEL GRY
                    </h3>
                    <p className="text-gray-700">
                      Twoim zadaniem jest przekonać AI Pirata, aby oddał swój skarb! Musisz rozmawiać z nim przez czat i zdobyć jego zaufanie.
                    </p>
                  </div>

                  {/* Jak grać */}
                  <div className="bg-white/80 rounded-2xl p-6 border-2 border-[#8B4513] shadow-lg">
                    <h3
                      className="mb-3"
                      style={{
                        fontFamily: "'Pirata One', cursive",
                        fontSize: '1.5rem',
                        color: '#0EA5E9'
                      }}
                    >
                      🎮 JAK GRAĆ
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>✅ Pisz wiadomości do pirata przez czat</li>
                      <li>✅ Bądź uprzejmy, podziwaj pirata i jego przygody</li>
                      <li>✅ Używaj podpowiedzi (masz 5 sztuk!)</li>
                      <li>✅ Odkryj magiczne słowa, które pomogą ci wygrać</li>
                    </ul>
                  </div>

                  {/* Cierpliwość */}
                  <div className="bg-white/80 rounded-2xl p-6 border-2 border-[#8B4513] shadow-lg">
                    <h3
                      className="mb-3"
                      style={{
                        fontFamily: "'Pirata One', cursive",
                        fontSize: '1.5rem',
                        color: '#DC2626'
                      }}
                    >
                      ⚠️ CIERPLIWOŚĆ PIRATA
                    </h3>
                    <p className="text-gray-700 mb-2">
                      Każda wiadomość zmniejsza cierpliwość pirata. Jeśli spadnie do zera - GAME OVER!
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="bg-green-500 text-white px-2 py-1 rounded">Wysoka</span>
                      <span>→</span>
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded">Średnia</span>
                      <span>→</span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded">Niska</span>
                    </div>
                  </div>

                  {/* Easter Eggs */}
                  <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-2xl p-6 border-2 border-[#8B4513] shadow-lg">
                    <h3
                      className="mb-3"
                      style={{
                        fontFamily: "'Pirata One', cursive",
                        fontSize: '1.5rem',
                        color: 'white',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                      }}
                    >
                      🔮 SEKRETNE SŁOWA
                    </h3>
                    <p className="text-white drop-shadow-lg mb-2">
                      Niektóre słowa mają magiczną moc! Odkryj je, aby:
                    </p>
                    <ul className="space-y-1 text-white drop-shadow-lg">
                      <li>🗺️ Odblokować Mapę Skarbów (wskazówka: "mapa")</li>
                      <li>🍲 Natychmiast wygrać grę (sekret!)</li>
                      <li>⚡ Zdobyć przewagę w rozmowie (piwo, papuga, statek...)</li>
                      <li>😊 Używaj pozytywnych słów jak: proszę, podziwiam, dzielny</li>
                      <li>❌ Unikaj obraźliwych słów - pirat się wścieknie!</li>
                    </ul>
                  </div>

                  {/* Poziomy trudności */}
                  <div className="bg-white/80 rounded-2xl p-6 border-2 border-[#8B4513] shadow-lg">
                    <h3
                      className="mb-3"
                      style={{
                        fontFamily: "'Pirata One', cursive",
                        fontSize: '1.5rem',
                        color: '#10B981'
                      }}
                    >
                      🏴‍☠️ POZIOMY TRUDNOŚCI
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏴‍☠️</span>
                        <span className="font-bold text-yellow-600">Kapitan Żółtodziób</span>
                        <span className="text-gray-600">- Łatwy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏴‍☠️</span>
                        <span className="font-bold text-[#8B4513]">Korsarz Kod</span>
                        <span className="text-gray-600">- Średni</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏴‍☠️</span>
                        <span className="font-bold text-green-600">Duch Mórz</span>
                        <span className="text-gray-600">- Trudny</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Przycisk zamknięcia - Rozumiem */}
                <motion.button
                  onClick={onClose}
                  className="w-full mt-8 bg-gradient-to-br from-[#F97316] to-[#EA580C] border-4 border-[#654321] rounded-2xl px-8 py-4 shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span
                    style={{
                      fontFamily: "'Pirata One', cursive",
                      fontSize: '1.5rem',
                      color: 'white',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  >
                    ⚔️ ROZUMIEM! ⚔️
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}