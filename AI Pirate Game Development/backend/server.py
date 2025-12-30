# ==========================================
# 🏴‍☠️ AI PIRATE GAME - BACKEND TEMPLATE
# Ten plik służy jako szkielet dla zespołu backendowego.
# ==========================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from pydantic import BaseModel
import os
import uuid
# import edge_tts  <-- Opcjonalnie, jeśli używacie Edge jako fallback
# import elevenlabs <-- Tutaj wasza biblioteka do ElevenLabs

app = FastAPI(title="AI Pirate Game Backend")

# === KONFIGURACJA CORS (Dla Frontendu na localhost) ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Na produkcji warto zmienić na konkretne domeny
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === 🧠 LOGIKA GRY (SYSTEM PROMPTS) ===
# WAŻNE: Nie zmieniajcie logiki tagów [HAPPY], [ANGRY], [GIVE_MAP].
# Frontend opiera na nich mechanikę gry (pasek postępu, wygrana).

BASE_INSTRUCTION = """
Jesteś postacią w SZYBKIEJ grze. Gracz ma tylko 30 sekund na wygraną.
TWOJE ZADANIE:
1. Odpowiadaj maksymalnie 1 zdaniem. Bądź dynamiczny.
2. ZAWSZE zaczynaj od tagu emocji: [HAPPY], [ANGRY] lub [NEUTRAL].
3. WARUNEK PRZEGRANEJ (WIN CONDITION):
   Wystarczy JEDEN dobry argument trafiający w twoją słabość.
   Jeśli gracz trafił w punkt -> napisz [HAPPY] [GIVE_MAP] i zakończ wypowiedź.
"""

CHARACTER_PROMPTS = {
    "zoltodziob": {
        "prompt": f"""
        {BASE_INSTRUCTION}
        POSTAĆ: Kapitan Żółtodziób.
        SŁABOŚĆ: Boisz się duchów, klątw i swojej mamy.
        """
    },
    "korsarz": {
        "prompt": f"""
        {BASE_INSTRUCTION}
        POSTAĆ: Korsarz Kod.
        SŁABOŚĆ: Chciwy biznesmen. Działa na niego % zysku, łapówka, spółka.
        """
    },
    "duch": {
        "prompt": f"""
        {BASE_INSTRUCTION}
        POSTAĆ: Duch Mórz.
        SŁABOŚĆ: Depresyjny poeta. Działa na niego smutek, rymy, sens życia.
        """
    }
}

# === MODELE DANYCH (KONTRAKT Z FRONTENDEM) ===
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]
    # character: str <-- Opcjonalne, skoro mamy osobne endpointy /p1, /p2...

class TTSRequest(BaseModel):
    text: str
    character: str # zoltodziob | korsarz | duch

# ==========================================
# 🔌 ENDPOINTY (TU WSTAWICIE SWOJĄ LOGIKĘ)
# ==========================================

@app.get("/health")
async def health_check():
    """Używany przez Panel Admina do sprawdzenia czy backend żyje."""
    return {"status": "ok", "service": "Pirate AI Backend"}

# --- POSTAĆ 1: ŻÓŁTODZIOB ---
@app.post("/p1")
async def chat_zoltodziob(request: ChatRequest):
    """
    Endpoint dla Żółtodzioba.
    TODO: Podpiąć model LLM (np. OpenAI / Local Llama).
    TODO: Wstrzyknąć prompt systemowy: CHARACTER_PROMPTS["zoltodziob"]["prompt"]
    TODO: Zwrócić odpowiedź (JSON lub StreamingResponse).
    """
    
    # 💡 PRZYKŁAD PROSTY (BEZ STREAMINGU):
    # response_text = call_your_llm(request.messages, system_prompt)
    # return {"text": response_text}
    
    # 💡 PRZYKŁAD STREAMINGU (SSE - Server Sent Events):
    # return StreamingResponse(your_generator_function(), media_type="text/event-stream")

    return {"text": "[NEUTRAL] Arrr! Jestem Żółtodziób (Mock Endpoint)."}


# --- POSTAĆ 2: KORSARZ ---
@app.post("/p2")
async def chat_korsarz(request: ChatRequest):
    """Endpoint dla Korsarza."""
    return {"text": "[ANGRY] Czas to pieniądz! Co chcesz? (Mock Endpoint)"}


# --- POSTAĆ 3: DUCH ---
@app.post("/p3")
async def chat_duch(request: ChatRequest):
    """Endpoint dla Ducha."""
    return {"text": "[NEUTRAL] Wieją zimne wiatry... (Mock Endpoint)"}


# --- TTS: GENEROWANIE GŁOSU ---
@app.post("/api/tts")
async def tts_endpoint(request: TTSRequest):
    """
    Generuje plik audio.
    TODO: Podpiąć ElevenLabs API.
    Input: text (string), character (string)
    Output: Plik audio (audio/mpeg)
    """
    print(f"🎤 TTS Request: {request.text} ({request.character})")
    
    # TODO: Zaimplementujcie logikę ElevenLabs tutaj
    # audio_stream = elevenlabs.generate(...)
    # return StreamingResponse(audio_stream, media_type="audio/mpeg")

    # MOCK (Zwraca błąd 404 dopóki nie zaimplementujecie):
    return JSONResponse(content={"error": "TTS not implemented yet"}, status_code=501)


if __name__ == "__main__":
    import uvicorn
    # Backendowcy mogą tu zmienić port, frontend dostosuje się w Admin Panelu.
    uvicorn.run(app, host="0.0.0.0", port=8000)