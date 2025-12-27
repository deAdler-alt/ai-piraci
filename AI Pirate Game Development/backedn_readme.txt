BACKEND (LOCALHOST)

Frontend oczekuje, że na localhost:3000 (lub innym porcie) będą dostępne dwa endpointy:

1. CHAT (LLM)
   - URL: POST http://localhost:3000/api/chat
   - Body: { 
       "character": "zoltodziob", 
       "message": "Cześć piracie", 
       "history": [...] 
     }
   - Response: { "text": "[HAPPY] Ahoj! Witaj na pokładzie." }

2. TTS (Text-to-Speech) - Głos Pirata
   - URL: POST http://localhost:3000/api/tts
   - Body: { "text": "Ahoj! Witaj na pokładzie.", "character": "zoltodziob" }
   - Response: PLIK AUDIO (audio/mpeg, audio/wav) - binary blob.

Jeśli backend nie działa, frontend wyświetli w czacie komunikat błędu połączenia, ale się nie wysypie.
STT (Mikrofon) działa w pełni po stronie przeglądarki (Web Speech API), więc backend nie musi go obsługiwać.