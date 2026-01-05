// src/services/game.service.ts
import { API_CONFIG } from "./api-config";

export interface GameResponse {
  game_id: string;
  pirate_response: string;
  merit_score: number;
  is_won: boolean;
  audio_url?: string; // Opcjonalne, jeśli backend to zwróci
}

class GameService {
  private currentGameId: string | null = null;

  async startGame(difficulty: string = "easy", pirateName: string = "Kapitan"): Promise<GameResponse> {
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
    this.currentGameId = data.game_id;
    return data;
  }

  async sendMessage(message: string): Promise<GameResponse> {
    if (!this.currentGameId) throw new Error("Brak aktywnej gry!");

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/game/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game_id: this.currentGameId,
        message: message,
      }),
    });

    if (!response.ok) throw new Error("Błąd komunikacji");
    return await response.json();
  }
}

export const gameService = new GameService();