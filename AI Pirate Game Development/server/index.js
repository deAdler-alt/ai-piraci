require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 8000;
const host = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());

// === KONFIGURACJA OPENROUTER ===
const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:8000", 
      "X-Title": "AI Pirate Game",
    },
});

const MODEL_NAME = "meta-llama/llama-3-8b-instruct";

const CHARACTERS = {
    zoltodziob: {
        name: "Kapitan Żółtodziób",
        role: "Jesteś 'Śmierdzącym Joe'. Stary, leniwy pirat. Łatwo cię przekupić jedzeniem.",
    },
    korsarz: {
        name: "Korsarz Kod",
        role: "Jesteś 'Czarnobrodym'. Groźny, szanujesz tylko siłę. Nienawidzisz tchórzy.",
    },
    duch: {
        name: "Duch Mórz",
        role: "Jesteś 'Duchem Mórz'. Mówisz zagadkami, jesteś mroczny i niecierpliwy.",
    }
};

app.post('/api/chat', async (req, res) => {
    try {
        const { message, characterId, currentPatience } = req.body;
        const charData = CHARACTERS[characterId] || CHARACTERS.korsarz;

        console.log(`[OpenRouter] Pytanie: "${message}" -> ${charData.name}`);

        const systemPrompt = `
        Jesteś w grze RPG. ${charData.role}
        Aktualna cierpliwość: ${currentPatience}/100.
        
        ZASADY:
        1. Gracz chce twój skarb.
        2. Obraza = duży spadek cierpliwości (-15 do -20).
        3. Przekonanie/Rozbawienie = wzrost cierpliwości (+10 do +20).
        4. Głupie gadanie = mały spadek (-5).
        5. Odpowiadaj krótko i pirackim slangiem!
        
        FORMAT ODPOWIEDZI (Zwróć TYLKO JSON):
        {
            "reply": "Twoja odpowiedź tekstowa",
            "patienceChange": (liczba całkowita),
            "isGameOver": (boolean, true jeśli cierpliwość <= 0),
            "isVictory": (boolean, true jeśli cierpliwość >= 100)
        }
        `;

        const completion = await client.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" } 
        });

        let rawContent = completion.choices[0].message.content;
        rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const data = JSON.parse(rawContent);
        console.log(`[OpenRouter] Odp: ${data.reply} (Zmiana: ${data.patienceChange})`);
        
        res.json(data);

    } catch (error) {
        console.error("❌ BŁĄD OpenRouter:", error);
        res.status(500).json({
            reply: "*Pirat zaniemówił...*",
            patienceChange: 0,
            isGameOver: false,
            isVictory: false
        });
    }
});

app.listen(port, host, () => {
    console.log(`Serwer OpenRouter działa na http://${host}:${port}`);
});