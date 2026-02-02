// src/services/game.service.ts
import { API_CONFIG } from "./api-config";

// 1. Rozszerzona definicja odpowiedzi (zgodna z nowym backendem)
export interface GameResponse {
  game_id: string;
  pirate_response: string;
  merit_score: number;
  audio_url?: string | null;
  is_won: boolean;
  is_lost: boolean;             // <--- NOWOŚĆ: Obsługa przegranej
  win_phrase_detected: boolean; // <--- NOWOŚĆ: Detekcja frazy
  negative_categories?: Record<string, number>;
}

export interface StartGameResponse {
  game_id: string;
  message: string;
  // Dodaj inne pola jeśli backend zwraca coś więcej przy starcie
}

class GameService {
  private currentGameId: string | null = null;

  // Rozpoczęcie gry
  async startGame(difficulty: string = "easy", pirateName: string = "Kapitan"): Promise<StartGameResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/game/start`, { // <--- Poprawny endpoint
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

  // Wysłanie wiadomości
  async sendMessage(message: string): Promise<GameResponse> {
    if (!this.currentGameId) throw new Error("Brak aktywnej gry!");

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/game/conversation`, { // <--- Poprawny endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game_id: this.currentGameId,
        message: message,
        include_audio: true // <--- Ważne: prosimy backend o audio
      }),
    });

    if (!response.ok) throw new Error("Błąd komunikacji z piratem");
    return await response.json();
  }
}

export const gameService = new GameService();