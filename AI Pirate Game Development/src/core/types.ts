export interface Message {
  id: string;
  text: string;
  isPlayer: boolean;
  timestamp: number;
  type?: "text" | "system";
}

export interface Character {
  id: string;
  name: string;
  emoji: string;
  avatarFolder?: string;
  role?: string;
  description?: string;
  difficulty?: string;
  avatar?: string;
}