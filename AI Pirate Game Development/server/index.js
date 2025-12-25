require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// === KONFIGURACJA KLIENTA KIE.AI ===
// Używamy biblioteki OpenAI, ale kierujemy ją do KIE.ai
const client = new OpenAI({
    apiKey: process.env.KIE_API_KEY,
    baseURL: process.env.KIE_BASE_URL || "https://api.kie.ai/v1", // Fallback URL
});

// === OSOBOWOŚCI I LOGIKA ===
const CHARACTERS = {
    zoltodziob: {
        name: "Kapitan Żółtodziób",
        traits: "Leniwy, chciwy na jedzenie, mało inteligentny, łatwo go zmanipulować.",
        weakness: "Wspomnienie o jedzeniu lub jego babci."
    },
    korsarz: {
        name: "Korsarz Kod",
        traits: "Dumny, agresywny, szanuje siłę i bezpośredniość. Nienawidzi kłamczuchów.",
        weakness: "Wyzwanie na pojedynek lub pochwała jego broni."
    },
    duch: {
        name: "Duch Mórz",
        traits: "Mroczny, poetycki, mówi zagadkami. Nie interesują go ziemskie sprawy.",
        weakness: "Wspomnienie o klątwie lub mapie."
    }
};

app.post('/api/chat', async (req, res) => {
    try {
        const { message, characterId, currentPatience } = req.body;
        
        // 1. Pobierz dane postaci
        const charData = CHARACTERS[characterId] || CHARACTERS.korsarz;

        console.log(`[KIE.ai] Zapytanie dla: ${charData.name}, Cierpliwość: ${currentPatience}`);

        // 2. Skonstruuj Prompt Systemowy
        const systemPrompt = `
        WCIEL SIĘ W ROLĘ: Jesteś ${charData.name}.
        CECHY CHARAKTERU: ${charData.traits}
        SŁABOŚCI: ${charData.weakness}
        
        SYTUACJA:
        Jesteś strażnikiem skarbu. Gracz próbuje cię przekonać, żebyś go oddał.
        Twój aktualny poziom cierpliwości to: ${currentPatience}/100.
        
        WIADOMOŚĆ GRACZA: "${message}"
        
        TWOJE ZADANIE:
        1. Przeanalizuj wiadomość gracza pod kątem twoich cech i słabości.
        2. Zdecyduj, jak zmienia się twoja cierpliwość (patienceChange).
           - Trafienie w słabość/komplement: +10 do +20.
           - Neutralna/Głupia odpowiedź: -5 do -10.
           - Obraza/Agresja: -15 do -25.
        3. Napisz odpowiedź (reply) w swoim stylu (używaj pirackiego żargonu!).
        
        FORMAT ODPOWIEDZI (WYMAGANY JSON):
        {
            "reply": "Twoja odpowiedź tutaj...",
            "patienceChange": (liczba całkowita),
            "isGameOver": (true jeśli cierpliwość <= 0),
            "isVictory": (true jeśli cierpliwość >= 100)
        }
        `;

        // 3. Wyślij zapytanie do KIE.ai
        const completion = await client.chat.completions.create({
            model: "kie-model-v1", // ⚠️ WAŻNE: Sprawdź w dok. KIE nazwę modelu. Często "gpt-4" lub "kie-chat" działa.
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" } // Wymuszenie JSON (kluczowe!)
        });

        // 4. Parsowanie odpowiedzi
        const content = completion.choices[0].message.content;
        const data = JSON.parse(content);

        console.log(`[KIE.ai] Odpowiedź: ${data.reply} (Zmiana: ${data.patienceChange})`);
        
        res.json(data);

    } catch (error) {
        console.error("❌ BŁĄD KIE.ai:", error.message);
        
        // Fallback w razie awarii API
        res.json({
            reply: "*Pirat zaniemówił...* (Błąd połączenia z KIE.ai. Sprawdź klucz i nazwę modelu!)",
            patienceChange: 0,
            isGameOver: false,
            isVictory: false
        });
    }
});

app.listen(port, () => {
    console.log(`🏴‍☠️ Serwer KIE.ai działa na porcie ${port}`);
});