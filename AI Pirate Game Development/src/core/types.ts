export interface Message {
  id: string;
  text: string;
  isPlayer: boolean;
  timestamp: number;
  // Dodajemy 'system' dla podpowiedzi w UI, 'text' to standardowa wiadomość
  type?: "text" | "system"; 
}

export interface Character {
  id: string;   // Ważne: musi być 'zoltodziob', 'korsarz' lub 'duch'
  name: string;
  description: string; // Tekst wyświetlany w menu wyboru
  
  // Opcjonalne pola UI
  avatarFolder?: string; // Nazwa folderu w /public/characters/ (jeśli inna niż id)
  difficulty?: "easy" | "medium" | "hard"; // Sugerowany poziom trudności
  
  // Stare pola (można usunąć jeśli nigdzie nie używasz):
  // emoji?: string;
  // role?: string;
}