import { API_CONFIG } from "./api-config";
import { Message } from "../core/types";

export const sendMessageToLLM = async (
  characterId: string,
  history: Message[],
  userMessage: string
): Promise<string> => {
  try {
    // 1. Wybór endpointu (z mapowania w configu lub domyślny fallback)
    // Zabezpieczenie: jeśli config nie ma endpointów, budujemy go dynamicznie
    let endpoint = "";
    if (API_CONFIG.LLM_ENDPOINT && typeof API_CONFIG.LLM_ENDPOINT === 'function') {
        endpoint = API_CONFIG.LLM_ENDPOINT(characterId);
    } else {
        // Fallback dla starej konfiguracji
        endpoint = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/${characterId}`;
    }

    console.log(`[LLM] Wysyłam do: ${endpoint}`);

    // 2. Formatowanie historii (ostatnie 10 wiadomości dla kontekstu)
    const formattedMessages = [
      ...history.slice(-10).map((msg) => ({
        role: msg.isPlayer ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: userMessage },
    ];

    // 3. Strzał do API (zwykły POST)
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: formattedMessages,
        // character: characterId // Opcjonalnie, jeśli backend tego wymaga w body
      }),
    });

    if (!response.ok) {
      throw new Error(`Błąd serwera: ${response.status}`);
    }

    // 4. Odbiór danych
    const data = await response.json();
    
    // Obsługa różnych formatów, które backend może zwrócić
    const content = data.text || data.content || data.message || "";

    if (!content) {
        console.warn("Backend zwrócił pustą odpowiedź:", data);
        return "[NEUTRAL] ... (Pirat zamilkł)";
    }

    return content;

  } catch (error) {
    console.error("LLM Service Error:", error);
    return "[NEUTRAL] (Papuga przegryzła kabel - błąd połączenia)";
  }
};