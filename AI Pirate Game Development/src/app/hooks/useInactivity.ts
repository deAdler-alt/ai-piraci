import { useEffect, useRef } from 'react';

export const useInactivity = (timeoutMs: number = 90000, onInactive: () => void) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        console.log("💤 Wykryto bezczynność - reset gry");
        onInactive();
      }, timeoutMs);
    };

    // Lista zdarzeń, które "budzą" aplikację
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    // Nasłuchujemy
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Startujemy licznik od razu
    resetTimer();

    // Sprzątanie po wyjściu
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMs, onInactive]);
};