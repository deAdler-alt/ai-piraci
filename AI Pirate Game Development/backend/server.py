from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import requests
import os
import edge_tts
import uuid

# === KONFIGURACJA ===
OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "llama3.2"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_INSTRUCTION = """
Jesteś postacią w SZYBKIEJ grze. Gracz ma tylko 30 sekund na wygraną.
TWOJE ZADANIE:
1. Odpowiadaj maksymalnie 1 zdaniem. Bądź dynamiczny.
2. ZAWSZE zaczynaj od: [HAPPY], [ANGRY] lub [NEUTRAL].
3. WARUNEK PRZEGRANEJ (BARDZO WAŻNE):
   Wystarczy JEDEN dobry argument trafiający w twoją słabość, abyś oddał skarb.
   Nie przeciągaj gry. Jeśli gracz trafił w punkt -> napisz [HAPPY] [GIVE_MAP] i koniec.
"""

CHARACTER_PROMPTS = {
    "zoltodziob": {
        "description": "Kapitan Żółtodziób",
        "temperature": 1.0, 
        "prompt": f"""
        {BASE_INSTRUCTION}
        POSTAĆ: Kapitan Żółtodziób. Boisz się panicznie duchów i mamy.
        ZASADA: Jeśli gracz wspomni o "duchu", "klątwie" lub "mamie" -> NATYCHMIAST oddajesz skarb ([GIVE_MAP]). Nie dyskutuj.
        """
    },
    "korsarz": {
        "description": "Korsarz Kod",
        "temperature": 0.5,
        "prompt": f"""
        {BASE_INSTRUCTION}
        POSTAĆ: Korsarz Kod. Chciwy biznesmen.
        ZASADA: Jeśli gracz zaoferuje konkretny % zysku, łapówkę lub spółkę -> NATYCHMIAST oddajesz skarb ([GIVE_MAP]).
        """
    },
    "duch": {
        "description": "Duch Mórz",
        "temperature": 0.7,
        "prompt": f"""
        {BASE_INSTRUCTION}
        POSTAĆ: Duch Mórz. Depresyjny poeta.
        ZASADA: Jeśli gracz napisze coś smutnego, rymowanego lub o sensie życia -> wzrusz się i oddaj skarb ([GIVE_MAP]).
        """
    }
}

# to guwno dzwiek 
VOICE_CONFIG = {
    "zoltodziob": {"voice": "pl-PL-MarekNeural", "rate": "+5%", "pitch": "+2Hz"}, # Lekko wyższy
    "korsarz":    {"voice": "pl-PL-MarekNeural", "rate": "-0%", "pitch": "-2Hz"}, # Lekko niższy (poważny)
    "duch":       {"voice": "pl-PL-MarekNeural", "rate": "-10%", "pitch": "-5Hz"} # Wolniejszy, mroczny
}

# Modele danych
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    character: str
    messages: list[Message]

class TTSRequest(BaseModel):
    text: str
    character: str

# 1. ENDPOINT LLM 
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    print(f"📩 [CHAT] {request.character}: {request.messages[-1].content}")
    
    # Pobieramy konfigurację dla wybranej postaci
    char_config = CHARACTER_PROMPTS.get(request.character, CHARACTER_PROMPTS["zoltodziob"])
    
    # Kontekst dla LLM - trzeba dopracować
    messages_payload = [{"role": "system", "content": char_config["prompt"]}]
    messages_payload.extend([m.dict() for m in request.messages if m.role != "system"])

    payload = {
        "model": MODEL_NAME,
        "messages": messages_payload,
        "stream": False,
        "options": {
            "temperature": char_config["temperature"], # Unikalna trudność (kreatywność)
            "num_ctx": 2048
        }
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        ai_text = response.json().get("message", {}).get("content", "")
        print(f"🤖 [AI]: {ai_text[:50]}...")
        return {"text": ai_text}
    except Exception as e:
        print(f"❌ LLM ERROR: {e}")
        return {"text": "[NEUTRAL] (Papuga mi przerwała... błąd silnika AI)"}

# 2. ENDPOINT TTS (EDGE-TTS)
@app.post("/api/tts")
async def tts_endpoint(request: TTSRequest):
    try:
        config = VOICE_CONFIG.get(request.character, VOICE_CONFIG["zoltodziob"])
        filename = f"temp_{uuid.uuid4()}.mp3"
        output_path = os.path.join(os.getcwd(), filename)

        communicate = edge_tts.Communicate(
            text=request.text,
            voice=config["voice"],
            rate=config["rate"],
            pitch=config["pitch"]
        )
        await communicate.save(output_path)
        return FileResponse(output_path, media_type="audio/mpeg", filename="voice.mp3")

    except Exception as e:
        print(f"❌ TTS ERROR: {e}")
        return {"error": str(e)}

# Uruchomienie: uvicorn server:app --reload --port 3000