// src/services/api-config.ts

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

// Exportujemy BASE_URL, bo resztę ścieżek buduje game.service.ts
export const API_CONFIG = {
  BASE_URL: adminConfig.baseUrl || ENV_BASE_URL,
};