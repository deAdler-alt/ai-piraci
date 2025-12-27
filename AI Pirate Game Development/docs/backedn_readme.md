# 🏴‍☠️ AI Pirate Game - Developer Documentation

## ⚙️ 1. Konfiguracja Połączenia (Frontend <-> Backend)

Aplikacja jest skonfigurowana domyślnie pod adres `http://localhost:3000`.
Jeśli Twój backend działa na innym porcie lub serwerze, masz dwie opcje zmiany konfiguracji:

### Opcja A (Zalecana - Plik lokalny)
Ta metoda nie zmienia kodu źródłowego i nie wpływa na innych programistów (plik jest ignorowany przez Gita).
Utwórz w głównym katalogu plik o nazwie **`.env.local`** i wpisz tam swój adres:

```env
VITE_API_URL=http://localhost:8000

```

*Frontend automatycznie wczyta ten plik. Po dodaniu pliku zrestartuj serwer frontendu.*

### Opcja B (Edycja Kodu)

Jeśli wolisz edytować kod "na sztywno", zajrzyj do pliku:
`src/services/api-config.ts`
I zmień wartość domyślną zmiennej `BASE_URL`.

---

## 🚀 2. Quick Start (Frontend)

Interfejs użytkownika zbudowany jest w **React + Vite + TypeScript**.

### Instalacja i Uruchomienie:

1. Upewnij się, że masz zainstalowane **Node.js**.
2. Zainstaluj zależności:
```bash
npm install

```


3. Uruchom wersję deweloperską:
```bash
npm run dev

```


Frontend będzie dostępny pod adresem: `http://localhost:5173`

---

## 🐍 3. Backend & Model AI (Python)

Backend odpowiada za logikę gry i generowanie głosu. Kod znajduje się w katalogu `/backend`.
Jest to referencyjna implementacja w **FastAPI** służąca jako proxy do modelu LLM.

### Instalacja Backendu:

1. Wejdź do katalogu: `cd backend`
2. Utwórz środowisko wirtualne i zainstaluj paczki:
```bash
python -m venv .venv
source .venv/bin/activate  # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt

```


3. Uruchom serwer (domyślnie port 3000):
```bash
python -m uvicorn server:app --reload --port 3000

```



### 🧠 Podłączanie Własnego Modelu (LLM)

Obecny kod w `server.py` korzysta z biblioteki `requests` do łączenia się z lokalną instancją Ollama.
**Docelowo należy tu wpiąć własny model** (np. lokalny Llama, Mistral, OpenAI API itp.).

Aby zmienić model:

1. Otwórz `backend/server.py`.
2. Znajdź funkcję `chat_endpoint`.
3. Zastąp logikę połączenia z Ollama własną integracją.
4. **WAŻNE:** Dostosować logikę Promptów Systemowych (słownik `CHARACTER_PROMPTS`), ponieważ definiują one zasady gry, poziomy trudności i warunki zwycięstwa.

---

## 🔌 4. Kontrakt API (API Reference)

Frontend oczekuje dwóch endpointów. Zachowanie tego formatu danych jest krytyczne dla działania gry.

### A. Endpoint Czatowy (Logic)

* **URL:** `POST /api/chat`
* **Cel:** Przetworzenie wiadomości gracza przez LLM z uwzględnieniem osobowości pirata.

**Request Body (JSON):**

```json
{
  "character": "zoltodziob",  // "zoltodziob" | "korsarz" | "duch"
  "messages": [
    { "role": "user", "content": "Oddaj mi mapę!" }
    // ...historia rozmowy
  ]
}

```

**Response Body (JSON):**

```json
{
  "text": "[ANGRY] Nie oddam! A kysz! [NEUTRAL]"
}

```

#### ⚠️ Wymogi dla modelu LLM (System Prompt):

Aby silnik gry (Game Engine) działał poprawnie, model **musi** zwracać w treści odpowiedzi specjalne tagi sterujące (zdefiniowane w `CHARACTER_PROMPTS`):

1. **Tagi Emocji:** `[HAPPY]`, `[ANGRY]`, `[NEUTRAL]` (na początku zdania). Sterują paskiem postępu.
2. **Tag Wygranej:** `[GIVE_MAP]` (gdy gracz wygra). Uruchamia ekran zwycięstwa i kończy grę.

---

### B. Endpoint Głosowy (TTS)

* **URL:** `POST /api/tts`
* **Cel:** Zamiana tekstu odpowiedzi pirata na plik audio.

**Request Body (JSON):**

```json
{
  "character": "zoltodziob",
  "text": "Nie oddam! A kysz!"
}

```

**Response:**

* **Content-Type:** `audio/mpeg` (lub inny format audio).
* Zwraca binarny plik audio.

---

## 📂 Struktura Projektu

* `src/` - Kod źródłowy Frontendu (React).
* `src/services/api-config.ts` - Konfiguracja adresów URL (Endpointy).
* `backend/` - Kod Backendu (Python/FastAPI).
* `backend/server.py` - Główny plik serwera (Prompty i TTS).




# 📂 Struktura Projektu i Opis Plików v2



### 🌳 Drzewo katalogów

```text
/
├── backend/                 # Serwer Python (Logika & AI)
│   ├── server.py            # GŁÓWNY PLIK BACKENDU (Prompty + API)
│   └── requirements.txt     # Zależności Pythona
├── public/                  # Zasoby statyczne
│   ├── characters/          # Grafiki awatarów (idle, happy, angry)
│   └── sounds/              # Efekty dźwiękowe (muzyka, sfx)
├── src/                     # Kod Frontendu (React)
│   ├── app/
│   │   ├── components/      # Komponenty wizualne (UI)
│   │   └── hooks/           # Logika stanu gry (Engine)
│   ├── core/                # Typy i stałe globalne
│   └── services/            # Komunikacja z API
├── .env.local               # (Opcjonalny) Lokalna konfiguracja adresu API
├── README.md                # Dokumentacja techniczna
└── package.json             # Zależności Node.js

```

---

### 🐍 Backend (`/backend`)

To tutaj żyje "mózg" pirata.

* **`server.py`** – **Serce backendu.**
* Definiuje endpointy `/api/chat` i `/api/tts`.
* Zawiera słownik `CHARACTER_PROMPTS` (Osobowości, Instrukcje Systemowe, Warunki Wygranej).
* Zawiera konfigurację `VOICE_CONFIG` (parametry głosu dla każdej postaci).
* Łączy się z modelem LLM (obecnie Ollama) i silnikiem TTS (Edge-TTS).


* **`requirements.txt`** – Lista bibliotek potrzebnych do uruchomienia serwera (`fastapi`, `uvicorn` etc.).

---

### ⚛️ Frontend - Logika i Komunikacja (`/src`)

Warstwa, która zarządza danymi i łączy się z backendem.

* **`services/api-config.ts`** – **Centrum Konfiguracji.**
* Definiuje adres URL backendu.
* To tutaj kod decyduje, czy łączyć się z `localhost:3000` czy z adresem z `.env.local`.


* **`services/llm.service.ts`** – "Kurier" wiadomości tekstowych. Wysyła historię czatu do backendu i odbiera odpowiedź pirata.
* **`services/tts.service.ts`** – "Kurier" dźwięku. Pobiera plik `.mp3` z wypowiedzią pirata.
* **`core/constants.ts`** – Stałe wizualne i matematyczne (np. poziomy trudności paska postępu, opisy postaci dla UI).
* **`core/types.ts`** – Definicje typów TypeScript (Interfejsy `Message`, `Character`).

---

### 🎮 Frontend - Silnik Gry (`/src/app/hooks`)

* **`useGameEngine.ts`** – **Silnik Gry (Game Loop).**
* Zarządza stanem: Pasek Przekonania (matematyka Fibonacciego), Historia Czatu, Stan Wygranej/Przegranej.
* Obsługuje logikę "co się dzieje po otrzymaniu odpowiedzi" (np. wykrywa tag `[HAPPY]` i zwiększa pasek, wykrywa `[GIVE_MAP]` i kończy grę).
* Zarządza odtwarzaniem dźwięków (SFX).



---

### 🎨 Frontend - Interfejs (`/src/app/components`)

To, co widzi gracz.

* **`LandingScreen.tsx`** – Ekran startowy. Wybór postaci, animacja monet, intro.
* **`GameInterface.tsx`** – **Główny ekran rozgrywki.**
* Renderuje czat, awatara w oknie (bulaju), pasek postępu.
* Obsługuje Input tekstowy i Mikrofon (Web Speech API).
* Wyświetla podpowiedzi i animacje zwycięstwa.


* **`App.tsx`** – Główny kontener. Zarządza przełączaniem między ekranem startowym a grą oraz muzyką w tle (`bg_music.mp3`).

---

### 🖼️ Zasoby (`/public`)

* **`characters/{id}/*.png`** – Pliki graficzne postaci. Każda postać ma folder z plikami: `idle.png`, `happy.png`, `angry.png`, `thinking.png`.
* **`sounds/`** – Pliki audio: `bg_music.mp3` (tło), `scribble.mp3` (efekt pisania), itp.

```
