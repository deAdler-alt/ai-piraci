import { useEffect, useState, useRef, useCallback } from 'react';

export const useInactivity = (timeoutMs: number = 45000, onInactive: () => void) => {
  const [timeLeft, setTimeLeft] = useState(timeoutMs / 1000);
  const lastInteraction = useRef(Date.now());
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    lastInteraction.current = Date.now();
    setTimeLeft(timeoutMs / 1000);
  }, [timeoutMs]);

  useEffect(() => {
    // Funkcja sprawdzająca czas
    const checkInactivity = () => {
      const now = Date.now();
      const elapsed = now - lastInteraction.current;
      const remaining = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));
      
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerInterval.current) clearInterval(timerInterval.current);
        onInactive();
      }
    };

    // Nasłuchiwane zdarzenia
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Start interwału (sprawdzamy co 100ms dla płynności)
    timerInterval.current = setInterval(checkInactivity, 100);

    // Sprzątanie
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMs, onInactive, resetTimer]);

  return timeLeft;
};