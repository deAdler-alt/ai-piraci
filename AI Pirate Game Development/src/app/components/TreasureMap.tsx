import { useState, useEffect } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "motion/react";
import { ArrowLeft, Anchor, Compass } from "lucide-react";

interface TreasureMapProps {
  onComplete: () => void;
  onBack?: () => void;
}

// Punkty zatrzymania (0 do 1)
const STOPS = [0, 0.35, 0.68, 1];

// Dialogi załogi (Wolniejsze)
const CREW_CHATTER = [
  "Patrz na gwiazdy, nie na fale...",
  "Czuję zapach złota w powietrzu!",
  "Mewy krzyczą... idzie sztorm?",
  "Zapasy rumu są bezpieczne, kapitanie.",
  "To wieloryb? Nie, to teściowa bosmana...",
  "Trzymać kurs na północny zachód!",
  "Legenda mówi, że ta mapa jest przeklęta...",
  "Jeszcze tylko kawałek, chłopcy!",
];

// Dekoracje (Góry, Lasy, Fale, Skały)
const DECORATIONS = [
  { type: "forest", x: 100, y: 100 },
  { type: "mount", x: 50, y: 150 },
  { type: "wave", x: 200, y: 200 },
  { type: "land", x: 600, y: 50 },
  { type: "forest", x: 650, y: 80 },
  { type: "wave", x: 500, y: 150 },
  { type: "mount", x: 1100, y: 100 },
  { type: "mount", x: 1150, y: 80 },
  { type: "forest", x: 1050, y: 150 },
  { type: "land", x: 100, y: 400 },
  { type: "forest", x: 80, y: 450 },
  { type: "wave", x: 250, y: 350 },
  { type: "wave", x: 950, y: 400 },
  { type: "land", x: 1100, y: 350 },
  { type: "forest", x: 1150, y: 400 },
  { type: "mount", x: 300, y: 800 },
  { type: "forest", x: 250, y: 820 },
  { type: "wave", x: 100, y: 750 },
  { type: "wave", x: 600, y: 750 },
  { type: "wave", x: 650, y: 800 },
  { type: "forest", x: 900, y: 800 },
  { type: "mount", x: 950, y: 780 },
  { type: "land", x: 1000, y: 850 },
];

export function TreasureMap({
  onComplete,
  onBack,
}: TreasureMapProps) {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [isSailing, setIsSailing] = useState(false);
  const [crewMessage, setCrewMessage] = useState<string | null>(
    null,
  );

  const progress = useMotionValue(0);

  // Bezpieczna ścieżka (Idealnie zgrana z punktami poniżej)
  // Punkty: (150,700) -> (500,350) -> (850,500) -> (1100,200)
  const pathData =
    "M 150 700 C 350 650, 300 300, 500 350 S 750 600, 850 500 S 1000 150, 1100 200";

  // --- LOGIKA ---
  useEffect(() => {
    let interval: number;
    setCrewMessage(
      CREW_CHATTER[
        Math.floor(Math.random() * CREW_CHATTER.length)
      ],
    );

    interval = setInterval(() => {
      setCrewMessage(
        CREW_CHATTER[
          Math.floor(Math.random() * CREW_CHATTER.length)
        ],
      );
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !isSailing &&
        currentStopIndex < STOPS.length - 1
      ) {
        e.preventDefault();
        handleSail();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [isSailing, currentStopIndex]);

  const handleSail = () => {
    if (isSailing || currentStopIndex >= STOPS.length - 1)
      return;

    setIsSailing(true);
    const nextIndex = currentStopIndex + 1;

    animate(progress, STOPS[nextIndex], {
      duration: 5.0,
      ease: "easeInOut",
      onComplete: () => {
        setIsSailing(false);
        setCurrentStopIndex(nextIndex);
        if (nextIndex === STOPS.length - 1)
          setTimeout(onComplete, 2000);
      },
    });
  };

  const offsetDistance = useTransform(
    progress,
    (v) => `${v * 100}%`,
  );
  const pathLength = useTransform(progress, [0, 1], [0, 1]);
  const wakeOpacity = useTransform(progress, (v) =>
    isSailing ? 1 : 0,
  );

  return (
    <div className="min-h-screen bg-[#1a120b] flex items-center justify-center p-0 md:p-4 overflow-hidden relative">
      {/* 1. TŁO - DREWNIANE BELKI */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          // Ciemne drewno: wzór pionowych desek + słoje drewna
          backgroundImage: `
                   repeating-linear-gradient(90deg, #2a1b12 0px, #2a1b12 48px, #0f0906 50px),
                   url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")
               `,
          backgroundBlendMode: "overlay",
        }}
      />
      {/* Winieta na deskach */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      {/* === KONTENER MAPY === */}
      <div
        className="relative w-full h-full md:w-[98vw] md:h-[90vh] bg-[#dcb484] shadow-[0_0_150px_rgba(0,0,0,1)] rounded-sm overflow-hidden"
        style={{
          // Poszarpane krawędzie
          clipPath: "polygon(1% 1%, 99% 2%, 98% 98%, 2% 99%)",
        }}
      >
        <div className="absolute inset-0 p-4 md:p-8">
          {/* --- EFEKTY PAPIERU --- */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply z-0"
            style={{
              filter: "contrast(130%)",
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "radial-gradient(circle, transparent 50%, rgba(60, 40, 20, 0.4) 80%, rgba(20, 10, 5, 0.9) 100%)",
              mixBlendMode: "multiply",
            }}
          />
          {/* Plamy */}
          <div className="absolute top-[15%] right-[15%] w-80 h-80 bg-[#4e342e] opacity-15 rounded-full blur-[80px] mix-blend-multiply" />

          {/* 2. PRZYCISK POWROTU (WEWNĄTRZ MAPY) */}
          {onBack && (
            <motion.button
              onClick={onBack}
              className="absolute top-8 left-8 z-50 bg-[#2a1b12] text-[#deb887] border-2 border-[#5d4037] rounded-full p-3 shadow-xl hover:text-[#FFD700] hover:border-[#FFD700] transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Wróć do gry"
            >
              <ArrowLeft size={28} />
            </motion.button>
          )}

          {/* TYTUŁ MAPY */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 text-center w-full pointer-events-none">
            <h2
              style={{ fontFamily: "'Pirata One', cursive" }}
              className="text-5xl md:text-7xl text-[#2a1b12] tracking-[0.2em] drop-shadow-sm mb-2"
            >
              MAPA SKARBÓW
            </h2>

            {/* 3. DIALOGI ZAŁOGI (POD TYTUŁEM) - NOWY STYL */}
            <div className="h-20 flex items-center justify-center mt-2 pointer-events-auto">
              <AnimatePresence mode="wait">
                {crewMessage && (
                  <motion.div
                    key={crewMessage}
                    initial={{ opacity: 0, y: 5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.9 }}
                    className="relative px-8 py-3 rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                    style={{
                      // TŁO DREWNIANE
                      background:
                        "linear-gradient(180deg, #3e2723 0%, #2a1b12 100%)",
                      // ZŁOTA RAMKA
                      border: "3px solid #2a1b12",
                      boxShadow:
                        "0 0 10px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(0,0,0,0.8)",
                    }}
                  >
                    {/* Złote ćwieki w rogach */}
                    <div className="absolute top-1 left-1 w-2 h-2 bg-[#898989] rounded-full shadow-sm" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-[#898989] rounded-full shadow-sm" />
                    <div className="absolute bottom-1 left-1 w-2 h-2 bg-[#898989] rounded-full shadow-sm" />
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-[#898989] rounded-full shadow-sm" />

                    {/* TEKST ZŁOTY, POGRUBIONY, ITALIC */}
                    <p
                      className="font-serif italic font-bold text-lg md:text-xl tracking-wide text-center"
                      style={{
                        color: "lightgoldenrodyellow",
                        textShadow:
                          "1px 1px 2px rgba(0,0,0,0.8)",
                      }}
                    >
                      "{crewMessage}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Róża wiatrów */}
          <div className="absolute bottom-8 right-8 opacity-15 z-0">
            <Compass
              size={225}
              className="text-[#3e2723]"
              strokeWidth={1}
            />
          </div>

          {/* --- SVG MAPA --- */}
          <svg
            viewBox="0 0 1300 900"
            className="absolute inset-0 w-full h-full z-10"
          >
            <defs>
              <filter id="inkBleed">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.6"
                  numOctaves="3"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="3"
                />
                <feGaussianBlur stdDeviation="0.4" />
              </filter>
              <linearGradient
                id="riverGrad"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor="#b3e5fc"
                  stopOpacity="0.2"
                />
                <stop
                  offset="100%"
                  stopColor="#4fc3f7"
                  stopOpacity="0.5"
                />
              </linearGradient>
            </defs>

            {/* DEKORACJE TŁA */}
            <g
              stroke="#5d4037"
              strokeWidth="2"
              fill="none"
              opacity="0.4"
              filter="url(#inkBleed)"
            >
              {DECORATIONS.map((dec, i) => {
                if (dec.type === "mount")
                  return (
                    <path
                      key={i}
                      d={`M ${dec.x},${dec.y} L ${dec.x + 25},${dec.y - 40} L ${dec.x + 50},${dec.y} M ${dec.x + 15},${dec.y - 10} L ${dec.x + 35},${dec.y - 10}`}
                      strokeWidth="3"
                    />
                  );
                if (dec.type === "wave")
                  return (
                    <path
                      key={i}
                      d={`M ${dec.x},${dec.y} Q ${dec.x + 15},${dec.y - 8} ${dec.x + 30},${dec.y} Q ${dec.x + 45},${dec.y + 8} ${dec.x + 60},${dec.y}`}
                    />
                  );
                if (dec.type === "forest")
                  return (
                    <g key={i}>
                      <path
                        d={`M ${dec.x},${dec.y} L ${dec.x + 10},${dec.y - 25} L ${dec.x + 20},${dec.y}`}
                        fill="#8d6e63"
                        fillOpacity="0.3"
                      />
                      <path
                        d={`M ${dec.x + 15},${dec.y + 5} L ${dec.x + 25},${dec.y - 20} L ${dec.x + 35},${dec.y + 5}`}
                        fill="#8d6e63"
                        fillOpacity="0.3"
                      />
                      <path
                        d={`M ${dec.x + 30},${dec.y} L ${dec.x + 40},${dec.y - 25} L ${dec.x + 50},${dec.y}`}
                        fill="#8d6e63"
                        fillOpacity="0.3"
                      />
                    </g>
                  );
                if (dec.type === "land")
                  return (
                    <path
                      key={i}
                      d={`M ${dec.x},${dec.y} Q ${dec.x + 30},${dec.y - 20} ${dec.x + 60},${dec.y} Q ${dec.x + 30},${dec.y + 20} ${dec.x},${dec.y}`}
                      fill="#8d6e63"
                      fillOpacity="0.2"
                      stroke="none"
                    />
                  );
                return null;
              })}
            </g>

            {/* KONTURY LĄDÓW TŁA */}
            <g
              fill="#c4ac90"
              stroke="#8d6e63"
              strokeWidth="2"
              filter="url(#inkBleed)"
              opacity="0.4"
            >
              <path d="M -50,600 Q 150,500 300,650 Q 400,800 200,900 L -50,900 Z" />
              <path d="M 400,-50 Q 600,200 850,150 Q 1050,50 1100,-50 Z" />
              <path d="M 1250,200 Q 1100,400 1200,600 Q 1300,550 1350,300 Z" />
            </g>

            {/* RZEKA */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="80"
              strokeLinecap="round"
              filter="url(#inkBleed)"
              className="opacity-40"
            />
            <path
              d={pathData}
              fill="none"
              stroke="#5d4037"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />

            {/* ŚLAD ZA STATKIEM */}
            <motion.path
              d={pathData}
              fill="none"
              stroke="#1a0f0a"
              strokeWidth="6"
              strokeDasharray="15, 10"
              style={{ pathLength }}
            />

            {/* 4. PRZYSTANKI (IDEALNIE ZGRANE Z LINIAMI) */}
            {/* Koordynaty muszą pasować do punktów w `pathData`: (150,700), (500,350), (850,500), (1100,200) */}

            {/* START (150, 700) */}
            <g transform="translate(150, 700)">
              <circle
                r="15"
                fill="#2a1b12"
                filter="url(#inkBleed)"
              />
              <text
                x="0"
                y="55"
                textAnchor="middle"
                fontFamily="'Pirata One', cursive"
                fontSize="40"
                fill="#3e2723"
                fontWeight="bold"
              >
                Port Czaszek
              </text>
            </g>

            {/* STOP 1 (500, 350) */}
            <g transform="translate(500, 350)">
              <circle
                r="15"
                fill="#2a1b12"
                filter="url(#inkBleed)"
              />
              <text
                x="0"
                y="-40"
                textAnchor="middle"
                fontFamily="'Pirata One', cursive"
                fontSize="40"
                fill="#3e2723"
                fontWeight="bold"
              >
                Wybrzeże Małp
              </text>
              {currentStopIndex >= 1 && (
                <path
                  d="M -15,-15 L 15,15 M 15,-15 L -15,15"
                  stroke="#b71c1c"
                  strokeWidth="6"
                />
              )}
            </g>

            {/* STOP 2 (850, 500) */}
            <g transform="translate(850, 500)">
              <circle
                r="15"
                fill="#2a1b12"
                filter="url(#inkBleed)"
              />
              <text
                x="0"
                y="60"
                textAnchor="middle"
                fontFamily="'Pirata One', cursive"
                fontSize="40"
                fill="#3e2723"
                fontWeight="bold"
              >
                Wiry Obłędu
              </text>
              {currentStopIndex >= 2 && (
                <path
                  d="M -15,-15 L 15,15 M 15,-15 L -15,15"
                  stroke="#b71c1c"
                  strokeWidth="6"
                />
              )}
            </g>

            {/* META (1100, 200) */}
            <g transform="translate(1100, 200)">
              <path
                d="M -25,-25 L 25,25 M 25,-25 L -25,25"
                stroke="#b71c1c"
                strokeWidth="10"
                filter="url(#inkBleed)"
              />
              <text
                x="0"
                y="60"
                textAnchor="middle"
                fontFamily="'Pirata One', cursive"
                fontSize="50"
                fill="#b71c1c"
                fontWeight="bold"
                letterSpacing="2px"
              >
                SKARB
              </text>
            </g>
          </svg>

          {/* --- STATEK --- */}
          <div className="absolute inset-0 z-30 pointer-events-none p-4 md:p-8">
            <svg className="w-full h-full overflow-visible">
              <defs>
                <path id="motionPath" d={pathData} />
              </defs>
            </svg>

            <motion.div
              className="absolute w-32 h-32 flex items-center justify-center -ml-16 -mt-16"
              style={{
                offsetPath: `path("${pathData}")`,
                offsetDistance: offsetDistance,
                offsetRotate: "auto 0deg",
              }}
            >
              {/* Kilwater */}
              <motion.div
                style={{ opacity: wakeOpacity }}
                className="absolute right-[55%] top-1/2 -translate-y-1/2 w-24 h-12 bg-white blur-md rounded-full transform origin-right scale-x-[-1] opacity-70"
              />

              {/* Ikona Statku */}
              <motion.div
                className="text-8xl filter drop-shadow-xl transform scale-x-[-1]"
                animate={{
                  rotate: [-5, 5, -5],
                  y: [-5, 5, -5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ⛵
              </motion.div>
            </motion.div>
          </div>

          {/* --- STEROWANIE --- */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
            <motion.button
              onClick={handleSail}
              disabled={
                isSailing ||
                currentStopIndex >= STOPS.length - 1
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative"
            >
              {/* Koło Sterowe */}
              <div
                className={`
                       w-28 h-28 bg-[#2a1b12] rounded-full border-4 border-[#5d4037] shadow-2xl
                       flex items-center justify-center transition-all duration-[5s] ease-in-out
                       ${isSailing ? "rotate-[1080deg]" : ""}
                       ${currentStopIndex >= STOPS.length - 1 ? "grayscale opacity-50" : "hover:border-[#deb887]"}
                   `}
              >
                <Anchor size={56} className="text-[#deb887]" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map(
                  (deg) => (
                    <div
                      key={deg}
                      className="absolute w-2 h-8 bg-[#3e2723] rounded-sm"
                      style={{
                        transform: `rotate(${deg}deg) translate(0, -48px)`,
                      }}
                    />
                  ),
                )}
              </div>

              {!isSailing &&
                currentStopIndex < STOPS.length - 1 && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1a0f0a] text-[#deb887] text-sm font-bold px-4 py-1 rounded border border-[#deb887] animate-pulse">
                    SPACJA / Kliknij
                  </div>
                )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}