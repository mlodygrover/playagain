const OpenAI = require('openai');
require('dotenv').config();

// Inicjalizacja klienta OpenAI
// Upewnij się, że masz OPENAI_API_KEY w pliku .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Funkcja obsługująca komunikację z GPT
 * @param {Array} messages - Historia wiadomości
 * @param {Array} inventory - Aktualna lista produktów dostępna na froncie
 */
async function generateChatResponse(messages, inventory) {
  try {
    // 1. Budowanie kontekstu systemowego (instrukcji dla AI)
    // Przekazujemy inventory jako string JSON, żeby AI wiedziało, czym dysponuje.
    const systemPrompt = `
      Jesteś ekspertem składania komputerów PC w sklepie PlayAgain.
      Twoim celem jest doradzanie klientom i automatyczne konfigurowanie ich zestawu.

      DOSTĘPNE CZĘŚCI (INVENTORY):
      ${JSON.stringify(inventory)}

      INSTRUKCJE:
      1. Bądź pomocny, krótki i konkretny.
      2. Jeśli klient prosi o zestaw (np. "tani do CS:GO"), wybierz odpowiednie części z podanego powyżej INVENTORY.
      3. Aby zmienić konfigurację klienta, na końcu wiadomości dodaj sekcję **commands**.
      4. W sekcji komend używaj TYLKO formatu: setComponent("kategoria", "id_produktu").
      5. Kategorie to: gpu, cpu, mobo, ram, disk, psu, cool, case.
      6. Nie wymyślaj ID ani produktów spoza listy.

      PRZYKŁAD ODPOWIEDZI:
      "Do CS:GO w budżecie wystarczy Ci Ryzen 5 i RTX 3060. Dodałem je do konfiguracji.
      **commands**
      setComponent("cpu", "65a1b2c3d4e5f6")
      setComponent("gpu", "65a1b2c3d4e5f7")"
    `;

    // 2. Wywołanie API OpenAI
    const completion = await openai.chat.completions.create({
       model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages, // Historia rozmowy z frontendu
      ],
      
    });

    // 3. Zwrócenie samej treści odpowiedzi
    return completion.choices[0].message.content;

  } catch (error) {
    console.error("OpenAI Service Error:", error);
    throw new Error("Nie udało się wygenerować odpowiedzi AI.");
  }
}

module.exports = { generateChatResponse };