// Funkcja pomocnicza do pobierania nadpisanych ustawień
const getAdminConfig = () => {
  try {
    const saved = localStorage.getItem("pirate_admin_config");
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

const adminConfig = getAdminConfig();
const ENV_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// AdminConfig ma priorytet nad Env, Env ma priorytet nad domyślnym stringiem
const BASE_URL = adminConfig.baseUrl || ENV_BASE_URL;

export const API_CONFIG = {
  LLM_ENDPOINT: (charId: string) => {
    // Jeśli w adminie nadpisano konkretny endpoint dla postaci, użyj go
    if (adminConfig.endpoints && adminConfig.endpoints[charId]) {
      return adminConfig.endpoints[charId];
    }
    // Domyślny schemat: BASE_URL + /charId
    return `${BASE_URL}/${charId}`;
  },
  
  TTS_ENDPOINT: `${BASE_URL}/api/tts`, // Zakładamy jeden bezpieczny endpoint
};