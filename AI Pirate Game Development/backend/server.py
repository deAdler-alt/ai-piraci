from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import os
import uuid
# import elevenlabs 

app = FastAPI(title="AI Pirate Game Backend")

# === CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === PROMPTY SYSTEMOWE (Krytyczne dla logiki gry) ===
BASE_INSTRUCTION = """
Jesteś postacią w szybkiej grze.
1. Odpowiadaj krótko (max 2 zdania).
2. ZAWSZE zaczynaj od tagu: [HAPPY], [ANGRY] lub [NEUTRAL].
3. Jeśli gracz trafi w twoją słabość -> napisz [HAPPY] [GIVE_MAP].
"""

CHARACTER_PROMPTS = {
    "zoltodziob": "Słabość: Duchy i Mama.",
    "korsarz": "Słabość: Pieniądze i Spółki.",
    "duch": "Słabość: Poezja i Smutek."
}

# === MODELE DANYCH ===
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]

class TTSRequest(BaseModel):
    text: str
    character: str

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# --- ENDPOINTY CZATOWE (ZWYKŁY JSON) ---

@app.post("/p1")
async def chat_zoltodziob(request: ChatRequest):
    """Żółtodziób - Endpoint REST (bez streamingu)"""
    # TODO: Wywołaj tutaj kie.ai / LLM
    print(f"P1 Request: {request.messages[-1].content}")
    
    # MOCK RESPONSE:
    return {"text": "[NEUTRAL] Arrr! Boję się duchów, ale nie dam mapy!"}

@app.post("/p2")
async def chat_korsarz(request: ChatRequest):
    """Korsarz - Endpoint REST"""
    return {"text": "[ANGRY] Czas to pieniądz! Co chcesz?"}

@app.post("/p3")
async def chat_duch(request: ChatRequest):
    """Duch - Endpoint REST"""
    return {"text": "[NEUTRAL] Smutno mi..."}


# --- TTS (AUDIO) ---
@app.post("/api/tts")
async def tts_endpoint(request: TTSRequest):
    """
    Input: { "text": "...", "character": "zoltodziob" }
    Output: Plik audio (audio/mpeg)
    """
    print(f"TTS Request: {request.text[:30]}...")
    
    # TODO: Podpięcie ElevenLabs / Kie.ai TTS
    # return FileResponse("sciezka/do/pliku.mp3")

    return JSONResponse(content={"error": "TTS Mock"}, status_code=501)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)