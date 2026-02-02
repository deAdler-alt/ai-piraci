# AI PIRACI - Gra Negocjacyjna z AI (v2.0)

Interaktywna gra edukacyjna, w której gracz wciela się w rolę negocjatora próbującego przekonać pirata (AI) do oddania skarbu. Gra wykorzystuje zaawansowane modele językowe (LLM), syntezę mowy (TTS) oraz rozpoznawanie mowy (STT), aby stworzyć immersyjne doświadczenie.

## 🚀 Główne Funkcjonalności

* **Inteligentni Przeciwnicy:** 3 unikalne osobowości (Żółtodziób, Korsarz, Duch) oparte na LLM.
* **System Oceny (Merit System):** Backend analizuje każdą wypowiedź gracza, przyznając punkty merytoryczne (-100 do +100).
* **Ranking i Styl:** Ocena końcowa składa się z Noty za Technikę (merytoryka) oraz Noty za Styl (szybkość rozwiązania zagadki).
* **Głos i Emocje:**
    * **TTS (Text-to-Speech):** Pirat odpowiada własnym głosem (ElevenLabs).
    * **STT (Speech-to-Text):** Gracz może mówić do mikrofonu zamiast pisać.
    * **Lip-Sync (Symulowany):** Tekst i animacje są zsynchronizowane z dźwiękiem.
* **Stabilna Architektura:** Backend jest jedynym źródłem prawdy ("Source of Truth") dla stanu gry (wygrana/przegrana).

---

## 🛠️ Stack Technologiczny

### Frontend
* **Framework:** React 18 + TypeScript + Vite
* **Styling:** Tailwind CSS + Framer Motion (Animacje)
* **Komunikacja:** REST API
* **Stan:** React Hooks (Custom `useGameEngine`)

### Backend
* **Framework:** Python FastAPI
* **AI Core:** LangChain + OpenRouter (Google Gemini 2.0 Flash Lite / GPT-4)
* **Audio:** ElevenLabs API
* **Analiza:** Autorski moduł `MeritCheckService`

### Infrastruktura
* **Konteneryzacja:** Docker + Docker Compose
* **Serwer WWW:** Nginx (Reverse Proxy)

---

## ⚙️ Instalacja i Uruchomienie

Projekt jest w pełni skonteneryzowany. Wymagany jest Docker Desktop.

### 1. Konfiguracja Zmiennych Środowiskowych
W folderze `backend` utwórz plik `.env` i uzupełnij klucze API:

```env
OPENROUTER_API_KEY=sk-or-v1-...
ELEVENLABS_API_KEY=sk-...
# Opcjonalnie Google Credentials dla STT, jeśli używane

```

### 2. Uruchomienie (Produkcja)

Aby zbudować i uruchomić aplikację w trybie produkcyjnym:

```bash
docker-compose down
docker-compose up --build -d

```

### 3. Dostęp do Aplikacji

* **Gra:** [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)
* **Panel Admina:** [http://localhost:5173/admin](https://www.google.com/search?q=http://localhost:5173/admin) (Hasło domyślne: `pirat123`)
* **Dokumentacja API (Swagger):** [http://localhost:8000/docs](https://www.google.com/search?q=http://localhost:8000/docs)

---

## 🎮 Jak to działa? (Logika Gry)

W tej wersji (v2.0) wprowadzono ścisły podział odpowiedzialności:

1. **Backend jako Sędzia:**
* To Backend decyduje o flagach `is_won` (Wygrana) i `is_lost` (Przegrana).
* Frontend nie liczy punktów samodzielnie – jedynie wyświetla stan otrzymany z serwera.


2. **Przepływ Tury (Synchronizacja Audio):**
* Gracz wysyła wiadomość.
* Backend zwraca: Tekst + Audio URL + Wynik + Status Gry.
* Frontend buforuje audio.
* **Start:** W momencie startu audio (`onplay`), pojawia się tekst w dymku.
* **Trwanie:** Pirat mówi, animacja twarzy działa. Interfejs jest zablokowany, ale gra się nie kończy.
* **Koniec:** Dopiero po zakończeniu nagrania (`onended`), Frontend sprawdza flagi `is_won`/`is_lost` i ewentualnie przełącza ekran na Zwycięstwo lub Lochy.


3. **Punktacja:**
* **Technika (0-100 pkt):** Bazuje na `merit_score` z backendu.
* **Styl (0-20 pkt):** Bonus za szybkie rozwiązanie (liczba tur).
* **Ranga:** Suma punktów określa rangę (od "Szczura Lądowego" do "Legendy Siedmiu Mórz").



---

## 📂 Struktura Projektu

```text
/
├── AI Pirate Game Development/
│   ├── backend/                 # Logika serwerowa (Python)
│   │   ├── main.py              # Punkt wejścia FastAPI
│   │   ├── services/            # Logika biznesowa (Pirate, Merit, ElevenLabs)
│   │   └── models/              # Modele danych Pydantic
│   ├── src/                     # Kod źródłowy Frontend (React)
│   │   ├── app/
│   │   │   ├── components/      # Komponenty UI (GameInterface, Victory, etc.)
│   │   │   └── hooks/           # Logika gry (useGameEngine.ts)
│   │   ├── core/                # Typy i stałe
│   │   └── services/            # Komunikacja z API
│   ├── public/                  # Zasoby statyczne (obrazki, dźwięki)
│   ├── Dockerfile.backend       # Obraz Backend
│   ├── Dockerfile.frontend      # Obraz Frontend
│   └── docker-compose.yml       # Orkiestracja

```

---

## 📝 Co dalej? (Rozwój)

Aby rozwinąć projekt w przyszłości, należy:

1. **Nowe Postacie:** Dodać opisy w `backend/models/pirate.py` i grafiki w `public/characters/`.
2. **Historia Rozmów:** Zaimplementować bazę danych (np. PostgreSQL) do trwałego zapisu logów czatu w `backend/services/pirate_service.py`.
3. **Więcej Emocji:** Rozbudować mapowanie emocji w `useGameEngine.ts` o nowe stany (np. "surprised", "laughing").

---
