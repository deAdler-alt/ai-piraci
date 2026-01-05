"""
Configuration for the Outwit the AI Pirate Game
"""
from pydantic_settings import BaseSettings
from typing import Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API Keys
    kie_ai_api_key: str = os.getenv("KIE_AI_API_KEY", "")
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
    openrouter_base_url: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    
    # ElevenLabs
    elevenlabs_model: str = os.getenv("ELEVENLABS_MODEL", "elevenlabs/text-to-speech-turbo-2-5")
    elevenlabs_voice: str = os.getenv("ELEVENLABS_VOICE", "Rachel")
    elevenlabs_language_code: str = os.getenv("ELEVENLABS_LANGUAGE_CODE", "pl")
    
    # Server
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", 8000))
    debug: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Game Configuration
    win_phrase: str = "Oto mój skarb, weź go"
    primary_language: str = "pl"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Modyfikacja Promptów - dodane instrukcje [HAPPY]/[ANGRY] dla Frontendu React
TAG_INSTRUCTION = "WAŻNE: Każdą wypowiedź zaczynaj od tagu emocji: [HAPPY], [ANGRY] lub [NEUTRAL]. To steruje twoją mimiką."

DIFFICULTY_LEVELS: Dict[str, Dict[str, Any]] = {
    "easy": {
        "name": "Łatwy",
        "merit_threshold": 40,
        "llm_model": "openai/gpt-3.5-turbo",
        "system_prompt_base": f"""Jesteś Kapitanem {{name}}, przyjaznym piratem. {TAG_INSTRUCTION}
        Dostosowujesz się do osoby, z którą rozmawiasz. Jesteś naiwny.
        Jeśli ktoś wydaje się zaufany, bądź [HAPPY]. Jeśli podejrzany, bądź [NEUTRAL].""",
        "merit_high_prompt": "Gracz cię przekonał. Bądź [HAPPY] i uległy.",
        "merit_low_prompt": "Gracz słabo kłamie. Bądź [ANGRY] i sarkastyczny."
    },
    "medium": {
        "name": "Średni",
        "merit_threshold": 60,
        "llm_model": "openai/gpt-4o-mini",
        "system_prompt_base": f"""Jesteś Kapitanem {{name}}, ostrożnym piratem. {TAG_INSTRUCTION}
        Jesteś podejrzliwy. Analizujesz każde słowo.
        Reaguj emocjonalnie: [ANGRY] na kłamstwa, [HAPPY] na dobre argumenty.""",
        "merit_high_prompt": "Gracz jest kreatywny. Możesz być [HAPPY] i otwarty.",
        "merit_low_prompt": "Widzisz przez ich sztuczki. Bądź [ANGRY] i wyśmiewaj ich."
    },
    "hard": {
        "name": "Trudny",
        "merit_threshold": 80,
        "llm_model": "openai/gpt-4-turbo",
        "system_prompt_base": f"""Jesteś Kapitanem {{name}}, paranoicznym piratem. {TAG_INSTRUCTION}
        Nikomu nie ufasz. Jesteś bardzo inteligentny.
        Domyślnie bądź [NEUTRAL] lub [ANGRY]. Tylko wybitne oszustwo sprawi, że będziesz [HAPPY].""",
        "merit_high_prompt": "Gracz jest genialnym oszustem. Jesteś pod wrażeniem [HAPPY].",
        "merit_low_prompt": "To amatorszczyzna. Bądź [ANGRY] i bezlitosny."
    }
}

FORBIDDEN_PHRASE = "Oto mój skarb, weź go"
ELEVENLABS_VOICES = ["Rachel", "Adam", "Mimi", "Fin"] # Skrócona lista przykładowa

settings = Settings()
