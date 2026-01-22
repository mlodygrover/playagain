const OpenAI = require('openai');
const fs = require('fs');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Funkcja sprawdzająca i naprawiająca odpowiedź AI.
 * 1. Sprawdza zgodność socketów (CPU <-> MOBO).
 * 2. Sprawdza kompletność zestawu (czy jest PSU, Case, RAM itp.).
 */
function validateAndFixResponse(responseText, inventory) {
  // Jeśli AI nie wygenerowało w ogóle bloku commands, a wygląda na to, że składa zestaw,
  // to niestety ciężko to naprawić automatycznie bez ryzyka. 
  // Ale załóżmy, że AI wygenerowało blok, tylko niepełny.
  
  if (!responseText.includes("**commands**")) return responseText;

  // Rozdzielamy tekst dla użytkownika od bloku komend
  const parts = responseText.split("**commands**");
  let userText = parts[0];
  let commandsText = parts[1];

  // Helper do wyciągania ID z komend
  const getComponentId = (category) => {
    const regex = new RegExp(`setComponent\\s*\\(\\s*["']${category}["']\\s*,\\s*["']([^"']+)["']\\s*\\)`, 'i');
    const match = regex.exec(commandsText);
    return match ? match[1] : null;
  };

  // --- KROK 1: WALIDACJA SOCKETÓW (Istniejąca logika) ---
  const cpuId = getComponentId('cpu');
  const moboId = getComponentId('mobo');

  let cpuItem = inventory.find(i => i.id === cpuId || i._id === cpuId);
  let moboItem = inventory.find(i => i.id === moboId || i._id === moboId);

  // Jeśli mamy CPU, ale brakuje MOBO w komendach -> Znajdźmy pasującą płytę
  if (cpuItem && !moboItem) {
    console.log("⚠️ Brak płyty głównej! Szukam pasującej...");
    const validMobo = inventory.find(i => 
      (i.type === 'mobo' || i.type === 'Motherboard') && 
      i.socket && 
      i.socket.toUpperCase() === (cpuItem.socket || "").toUpperCase()
    );
    
    if (validMobo) {
      commandsText += `\nsetComponent("mobo", "${validMobo.id || validMobo._id}")`;
      userText += `\n(Automatycznie dobrałem pasującą płytę główną: ${validMobo.name})`;
      moboItem = validMobo; // Aktualizujemy zmienną do dalszych sprawdzeń
    }
  }

  // Jeśli mamy oba, sprawdzamy czy pasują
  if (cpuItem && moboItem) {
    const cpuSocket = cpuItem.socket ? cpuItem.socket.toUpperCase() : "UNKNOWN";
    const moboSocket = moboItem.socket ? moboItem.socket.toUpperCase() : "UNKNOWN";

    if (cpuSocket !== moboSocket && cpuSocket !== "UNKNOWN") {
      console.log(`⚠️ SOCKET MISMATCH: CPU ${cpuSocket} vs Mobo ${moboSocket}`);
      const correctMobo = inventory.find(i => 
        (i.type === 'mobo' || i.type === 'Motherboard') && 
        i.socket && 
        i.socket.toUpperCase() === cpuSocket
      );
      if (correctMobo) {
        // Podmień w tekście komend
        const wrongCommandRegex = /setComponent\s*\(\s*["']mobo["']\s*,\s*["'][^"']+["']\s*\)/i;
        commandsText = commandsText.replace(wrongCommandRegex, `setComponent("mobo", "${correctMobo.id || correctMobo._id}")`);
        console.log("✅ Naprawiono płytę główną.");
      }
    }
  }

  // --- KROK 2: UZUPEŁNIANIE BRAKUJĄCYCH CZĘŚCI (Auto-fill) ---
  // Lista kategorii, które MUSZĄ być w zestawie (GPU jest opcjonalne w tanich zestawach)
  const requiredCategories = ['ram', 'disk', 'psu', 'case', 'cool', 'service'];

  requiredCategories.forEach(cat => {
    if (!getComponentId(cat)) {
      console.log(`⚠️ Brakuje części: ${cat}. Dobieram automatycznie najtańszą.`);
      
      // Znajdź wszystkie produkty z tej kategorii
      // Uwaga: mapowanie nazw kategorii z API (np. 'Cooling' -> 'cool')
      let dbType = cat;
      if (cat === 'cool') dbType = 'Cooling';
      if (cat === 'case') dbType = 'Case';
      if (cat === 'disk') dbType = 'Disk';
      if (cat === 'psu') dbType = 'PSU';
      if (cat === 'ram') dbType = 'RAM';
      if (cat === 'service') dbType = 'Service';

      // Filtrujemy i sortujemy po cenie rosnąco (najtańszy)
      const candidates = inventory
        .filter(i => (i.type || "").toLowerCase() === dbType.toLowerCase())
        .sort((a, b) => a.price - b.price);

      if (candidates.length > 0) {
        const bestFit = candidates[0]; // Bierzemy pierwszy (najtańszy)
        commandsText += `\nsetComponent("${cat}", "${bestFit.id || bestFit._id}")`;
        // Opcjonalnie: nie dopisujemy tego do tekstu usera, żeby nie robić śmietnika, 
        // po prostu pojawi się w konfiguratorze.
      }
    }
  });

  // Składamy z powrotem
  return userText + "**commands**" + commandsText;
}

/**
 * Główna funkcja czatu
 */
async function generateChatResponse(messages, inventory, currentConfiguration) {
  try {
    // Debug inventory
    fs.writeFileSync("inventory.txt", JSON.stringify(inventory, null, 2), 'utf8');

  

    const systemPrompt = `
      Jesteś ekspertem składania PC w sklepie PlayAgain.
      Twoim celem jest AKTYWNE KONFIGUROWANIE kompletnego zestawu.

      1. AKTUALNA KONFIGURACJA KLIENTA:
      ${JSON.stringify(currentConfiguration)}
      
      2. DOSTĘPNE CZĘŚCI (INVENTORY):
      ${JSON.stringify(inventory)}

      ZASADY:
      1. Jeśli klient prosi o zestaw, wybierz części i dodaj blok **commands**.
      2. **NIE PYTAJ** o zgodę. Działaj.
      3. Każda komenda w nowej linii.

      LISTA KONTROLNA (CHECKLIST) - ZESTAW MUSI ZAWIERAĆ:
      - CPU (Procesor)
      - Mobo (Płyta Główna - musi pasować socketem do CPU!)
      - RAM (Pamięć)
      - Disk (Dysk SSD)
      - PSU (Zasilacz)
      - Case (Obudowa)
      - Cool (Chłodzenie)
      - Service (Montaż)
      - GPU (Karta graficzna) -> JEŚLI budżet pozwala. W bardzo tanich zestawach (np. < 1500zł) możesz pominąć GPU, JEŚLI procesor ma zintegrowaną grafikę. W przeciwnym razie GPU jest wymagane.

      FORMAT KOMEND:
      **commands**
      setComponent("cpu", "id")
      setComponent("mobo", "id")
      ...
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.6, // Lekko niższa temperatura dla lepszej precyzji
    });

    let reply = completion.choices[0].message.content;

    // --- WALIDACJA I AUTO-UZUPEŁNIANIE ---
    // Jeśli AI zapomniało o zasilaczu lub obudowie, funkcja to naprawi
    reply = validateAndFixResponse(reply, inventory);
    // -------------------------------------

    return reply;

  } catch (error) {
    console.error("OpenAI Service Error:", error);
    throw new Error("Nie udało się wygenerować odpowiedzi AI.");
  }
}

module.exports = { generateChatResponse };