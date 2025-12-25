require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    console.log("🔍 Sprawdzam dostępne modele dla Twojego klucza...");
    // Pobieramy listę modeli
    // Czasami trzeba użyć pustego obiektu w argumencie, czasami nie - zależy od wersji biblioteki
    // Biblioteka @google/generative-ai nie ma bezpośredniej metody listModels w klasie głównej w starszych wersjach,
    // ale sprawdźmy czy zadziała standardowe podejście menedżera modeli.
    
    // Obejście dla sprawdzenia dostępności: Spróbujemy 'gemini-1.5-flash'
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("👉 Próba połączenia z modelem: gemini-1.5-flash");
    
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log("✅ SUKCES! Model 'gemini-1.5-flash' działa. Odpowiedź:", response.text());
    
  } catch (error) {
    console.error("❌ BŁĄD PODCZAS TESTU:");
    console.error(error.message);
    
    // Jeśli błąd zawiera listę dostępnych modeli, to super.
    // Jeśli nie, spróbujmy innego modelu:
    console.log("\n--- Próba nr 2: gemini-pro ---");
    try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result2 = await model2.generateContent("Hello");
        console.log("✅ SUKCES! Model 'gemini-pro' działa.");
    } catch(err2) {
        console.error("❌ Też nie działa.");
    }
  }
}

listModels();
