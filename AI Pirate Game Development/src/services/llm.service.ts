import { API_CONFIG } from "./api-config";
import { Message } from "../core/types";

export const sendMessageToLLM = async (
  characterId: string,
  history: Message[],
  userMessage: string
): Promise<string> => {
  try {
    const formattedMessages = [
      ...history.slice(-10).map((msg) => ({
        role: msg.isPlayer ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: userMessage },
    ];

    const response = await fetch(API_CONFIG.LLM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: formattedMessages,
        character: characterId,
      }),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.text || "";
    
    return content || "[NEUTRAL] ...";
    
  } catch (error) {
    console.error("LLM Service Error:", error);
    return "[NEUTRAL] (Papuga przegryzła kabel - błąd sieci)";
  }
};