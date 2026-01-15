const axios = require('axios');

async function fetchOffersFromAI(componentName) {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) throw new Error("Brak klucza PERPLEXITY_API_KEY");

    // Prompt wymuszający JSON
    const prompt = `
    Znajdź 10 aktualnych ofert sprzedaży (najlepiej używanych, najniższe ceny) dla podzespołu: "${componentName}".
    Przeszukaj polskie serwisy (Allegro, OLX, sklepy).
    Chodzi o oferty zawierajace tylko ten komponent, nie interesuja mnie oferty typu plyta glowna + procesor + chlodzenie.
    Zwróć odpowiedź TYLKO I WYŁĄCZNIE jako czysty JSON (bez markdown, bez '''json). Dopuszczalne stany to tylko nowe i uzywane - calkowicie nie dopuszczam uszkodzonych.
    Format tablicy obiektów:
    [
      {
        "title": "Tytuł oferty",
        "price": 1200.00 (jako liczba, w PLN),
        "url": "link do oferty",
        "platform": "Allegro/OLX/Inne"
      }
    ]
    Jeśli nie znajdziesz ofert, zwróć pustą tablicę [].
  `;

    try {
        const response = await axios.post('https://api.perplexity.ai/chat/completions', {
            model: 'sonar', // Model z dostępem do internetu
            messages: [
                { role: 'system', content: 'Jesteś precyzyjnym asystentem zakupowym. Zwracasz tylko dane JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.1 // Niska kreatywność = mniejsze ryzyko zmyślania cen
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const content = response.data.choices[0].message.content;

        // Czyszczenie odpowiedzi (AI czasem dodaje ```json na początku)
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);

    } catch (error) {
        console.error(`Błąd Perplexity dla ${componentName}:`, error.response?.data || error.message);
        return [];
    }
}
async function fetchMotherboardOffers(socket, formFactor) {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) throw new Error("Brak klucza PERPLEXITY_API_KEY");

    // Mapowanie nazw standardów dla lepszego wyszukiwania
    let standardQuery = formFactor;
    if (formFactor.toLowerCase().includes('mini')) standardQuery = "Mini-ITX"; // Korekta nazewnictwa
    if (formFactor.toLowerCase().includes('micro')) standardQuery = "Micro-ATX";

    const prompt = `
    Znajdź 15 aktualnych ofert sprzedaży płyt głównych spełniających kryteria:
    - Socket: ${socket}
    - Standard/Format: ${standardQuery}
    - Stan: Nowe lub Używane (sprawne)
    - Sklepy: Polskie (Allegro, Morele, X-Kom, OLX)
    
    Nie szukaj jednego konkretnego modelu. Znajdź RÓŻNE modele (Asus, MSI, Gigabyte itp.) pasujące do tych kryteriów.
    Wybierz najtańsze sensowne oferty.

    Zwróć odpowiedź TYLKO jako czysty JSON w formacie:
    [
      {
        "title": "Pełna nazwa znalezionej płyty",
        "price": 1200.00,
        "url": "link do oferty",
        "platform": "Allegro/Inne"
      }
    ]
  `;

    try {
        const response = await axios.post('https://api.perplexity.ai/chat/completions', {
            model: 'sonar',
            messages: [
                { role: 'system', content: 'Jesteś asystentem zakupowym IT. Zwracasz tylko JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.1
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const content = response.data.choices[0].message.content;
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error(`Błąd AI dla MOBO ${socket} ${formFactor}:`, error.message);
        return [];
    }
}

module.exports = { fetchOffersFromAI, fetchMotherboardOffers };
