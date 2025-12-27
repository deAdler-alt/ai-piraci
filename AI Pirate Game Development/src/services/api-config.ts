// src/services/api-config.ts

// ⚙️ KONFIGURACJA ADRESU BACKENDU
// Domyślnie łączymy się z localhost:3000.
// Aby to zmienić (np. gdy backend stoi na porcie 8000), utwórz plik .env.local
// w głównym katalogu i dodaj: VITE_API_URL=http://localhost:8000

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const API_CONFIG = {
  LLM_ENDPOINT: `${BASE_URL}/api/chat`,
  TTS_ENDPOINT: `${BASE_URL}/api/tts`,
};