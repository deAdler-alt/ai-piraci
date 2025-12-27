import { API_CONFIG } from "./api-config";

export const fetchPirateVoice = async (
  text: string,
  characterId: string
): Promise<string | null> => {
  try {
    const response = await fetch(API_CONFIG.TTS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        character: characterId,
      }),
    });

    if (!response.ok) return null;

    // Backend zwraca plik audio (Blob)
    const audioBlob = await response.blob();
    // Tworzymy tymczasowy URL do pliku w pamięci przeglądarki
    return URL.createObjectURL(audioBlob);

  } catch (error) {
    console.warn("TTS Service Error (Pirat milczy):", error);
    return null;
  }
};