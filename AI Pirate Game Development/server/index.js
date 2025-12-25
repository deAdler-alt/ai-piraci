require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// === BAZA DANYCH ODPOWIEDZI (Symulacja AI) ===
const RESPONSES = {
    zoltodziob: [
        "Arrr! Masz rację, młodziku. Zupa mojej babci była najlepsza! (+10)",
        "Co tam mamroczesz? Głodny jestem! (-5)",
        "Złoto? Jakie złoto? Tu są tylko stare gacie! (0)",
        "Podoba mi się twój styl. Może się dogadamy. (+15)",
        "Ziew... Nudzisz mnie bardziej niż flauta na Pacyfiku. (-10)"
    ],
    korsarz: [
        "Jesteś odważny, albo głupi. To mi się podoba! (+10)",
        "Nie drażnij lwa, szczurze lądowy! (-15)",
        "Hahaha! Dawno się tak nie uśmiałem. (+20)",
        "Ostrze mojej szabli jest ostrzejsze niż twój język. (-10)",
        "Milcz, zanim utnę ci język! (-20)"
    ],
    duch: [
        "Słyszę szepty... Czy to wiatr, czy twoja głupota? (-10)",
        "Zagadka rozwiązana? Jeszcze nie... (0)",
        "Twoja dusza jest czarna... prawie jak moja. (+10)",
        "Odejdź, żywy. To miejsce dla umarłych. (-15)",
        "Widzę prawdę w twoich oczach. (+15)"
    ]
};

app.post('/api/chat', async (req, res) => {
    // Symulujemy opóźnienie "myślenia" AI (1.5 sekundy)
    setTimeout(() => {
        const { message, characterId, currentPatience } = req.body;
        console.log(`[SYMULATOR] Gracz napisał do ${characterId}: "${message}"`);

        // 1. Pobierz pulę odpowiedzi dla danej postaci
        const answers = RESPONSES[characterId] || RESPONSES.korsarz;

        // 2. Wylosuj odpowiedź
        const randomReply = answers[Math.floor(Math.random() * answers.length)];

        // 3. Ustal zmianę cierpliwości na podstawie wylosowanej odpowiedzi
        // (Prosta logika: jeśli odpowiedź jest miła, to plus, jak wredna to minus)
        // W prawdziwym AI model sam by to ocenił. Tutaj oszukujemy dla testów.
        let change = 0;
        if (randomReply.includes("(+)")) change = 15;
        else if (randomReply.includes("(-)")) change = -15;
        else change = 0;

        // Usuwamy te znaczniki (+15) z tekstu, żeby gracz ich nie widział
        const cleanReply = randomReply.replace(/\(\+\d+\)|\(-\d+\)|\(0\)/g, "").trim();

        // 4. Wyślij odpowiedź do Reacta
        // Format jest IDENTYCZNY jak w prawdziwym AI, więc React nie zauważy różnicy
        res.json({
            reply: cleanReply,
            patienceChange: change,
            isGameOver: (currentPatience + change) <= 0,
            isVictory: (currentPatience + change) >= 100
        });

    }, 1500); // 1500ms opóźnienia
});

app.listen(port, () => {
    console.log(`🦜 Serwer (SYMULATOR) działa na porcie ${port}. Bezpieczny port!`);
});