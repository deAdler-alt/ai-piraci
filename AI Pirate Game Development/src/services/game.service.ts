import { API_CONFIG } from "./api-config";

// Typy zgodne z nowym backendem
export interface GameState {
  game_id: string;
  difficulty: string;
  merit_score: number;
  is_won: boolean;
}

export interface ChatResponse {
  game_id: string;
  pirate_response: string;    // Tekst pirata (z tagami [HAPPY] itp.)
  merit_score: number;        // Wynik 0-100
  is_won: boolean;            // Czy wygrana?
  audio_url?: string;         // URL do pliku audio (ElevenLabs)
  win_phrase_detected?: boolean;
}

class GameService {
  private currentGameId: string | null = null;

  // 1. Rozpoczęcie gry (niezbędne, by dostać ID)
  async startGame(difficulty: string = "easy", pirateName: string = "Kapitan"): Promise<GameState> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/game/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        difficulty, 
        pirate_name: pirateName 
      }),
    });

    if (!response.ok) throw new Error("Nie udało się rozpocząć gry");
    
    const data = await response.json();
    this.currentGameId = data.game_id; // Zapisujemy ID w pamięci serwisu
    console.log("🏴‍☠️ Nowa gra rozpoczęta, ID:", this.currentGameId);
    
    return data;
  }

  // 2. Wysłanie wiadomości
  async sendMessage(message: string, includeAudio: boolean = true): Promise<ChatResponse> {
    if (!this.currentGameId) {
      throw new Error("Brak aktywnej gry! Najpierw wywołaj startGame().");
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/game/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game_id: this.currentGameId,
        message: message,
        include_audio: includeAudio // Backend sam obsłuży ElevenLabs
      }),
    });

    if (!response.ok) throw new Error("Błąd komunikacji z piratem");
    
    return await response.json();
  }
  
  // Reset stanu
  reset() {
    this.currentGameId = null;
  }
}

export const gameService = new GameService();
