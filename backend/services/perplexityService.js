const axios = require('axios');

async function fetchOffersFromAI(componentName) {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) throw new Error("Brak klucza PERPLEXITY_API_KEY");

    // Prompt wymuszający JSON
    const prompt = `
    Znajdź 10 aktualnych ofert sprzedaży (najlepiej używanych) dla podzespołu: "${componentName}".
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

async function fetchRamOffers(specificCapacity = null) {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) throw new Error("Brak klucza PERPLEXITY_API_KEY");

    // Jeśli użytkownik wybrał konkretną pojemność (np. "16GB"), szukamy tylko jej.
    // Jeśli nie (null), szukamy przekroju od 8GB do 32GB.
    const capacityQuery = specificCapacity
        ? `o pojemności dokładnie ${specificCapacity}`
        : `o pojemnościach od 8GB do 32GB (szukaj ofert 8GB, 16GB oraz 32GB)`;

    const prompt = `
    Znajdź 20 aktualnych ofert sprzedaży pamięci RAM DDR4 do komputera stacjonarnego (DIMM).
    
    Kryteria:
    - Typ: Tylko DDR4.
    - Format: DIMM (Desktop). WYKLUCZ: SODIMM (laptop), ECC (serwerowe).
    - Pojemność: ${capacityQuery}. Mogą to być pojedyncze kości lub zestawy (np. 2x8GB, 2x16GB).
    - Stan: Nowe lub Używane (tylko w pełni sprawne).
    - Sklepy: Polskie (Allegro, OLX, Morele, X-Kom, Amazon.pl).
    
    Wybierz najkorzystniejsze cenowo oferty w stosunku do wydajności (CL/MHz).
    
    Zwróć odpowiedź TYLKO I WYŁĄCZNIE jako czysty JSON w formacie:
    [
      {
        "title": "Pełna nazwa pamięci (np. G.Skill Ripjaws V 16GB 3200MHz)",
        "price": 150.00 (liczba),
        "url": "link do oferty",
        "platform": "Allegro/OLX/Inne",
        "specs": "16GB DDR4 3200MHz CL16" (krótki opis parametrów)
      }
    ]
    Jeśli nie znajdziesz ofert, zwróć [].
  `;

    try {
        const response = await axios.post('https://api.perplexity.ai/chat/completions', {
            model: 'sonar',
            messages: [
                { role: 'system', content: 'Jesteś ekspertem od podzespołów PC. Zwracasz tylko JSON.' },
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

        // Czyszczenie markdowna
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);

    } catch (error) {
        console.error(`Błąd AI dla RAM DDR4:`, error.response?.data || error.message);
        return [];
    }
}
async function fetchDiskOffers(diskType, interfaceType, capacity) {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) throw new Error("Brak klucza PERPLEXITY_API_KEY");

    // Budowanie precyzyjnego zapytania
    // np. "Dysk SSD interfejs M.2 NVMe o pojemności 1000GB"
    const typeStr = diskType || "SSD"; // Domyślnie SSD
    const interfaceStr = interfaceType ? `interfejs ${interfaceType}` : "";
    const capacityStr = capacity ? `o pojemności ${capacity}GB` : "o pojemnościach 500GB, 1TB lub 2TB";

    // Konwersja 1000GB -> 1TB dla lepszego wyszukiwania (opcjonalne, ale pomocne)
    let sizeQuery = capacityStr;
    if (capacity === 1000) sizeQuery = "1TB";
    if (capacity === 2000) sizeQuery = "2TB";
    if (capacity === 512) sizeQuery = "512GB";

    const prompt = `
    Znajdź 15 aktualnych ofert sprzedaży dysków twardych do komputera PC.
    
    Kryteria:
    - Typ: ${typeStr} (Ważne!)
    - Interfejs/Złącze: ${interfaceStr} (np. M.2 NVMe lub SATA III).
    - Pojemność: Szukaj ofert ${sizeQuery}.
    - Stan: Nowe lub Używane (tylko w pełni sprawne, status SMART OK).
    - WYKLUCZ: Dyski zewnętrzne, obudowy, adaptery, dyski serwerowe (SAS).
    - Sklepy: Polskie (Allegro, OLX, Morele, X-Kom, Amazon.pl).
    
    Wybierz najkorzystniejsze cenowo oferty (Cena za GB).
    
    Zwróć odpowiedź TYLKO I WYŁĄCZNIE jako czysty JSON w formacie:
    [
      {
        "title": "Pełna nazwa dysku (np. Lexar NM620 1TB M.2)",
        "price": 200.00 (liczba),
        "url": "link do oferty",
        "platform": "Allegro/OLX/Inne",
        "specs": "1TB M.2 NVMe 3000MB/s" (krótki opis: pojemność, typ, prędkość)
      }
    ]
    Jeśli nie znajdziesz ofert, zwróć [].
  `;

    try {
        const response = await axios.post('https://api.perplexity.ai/chat/completions', {
            model: 'sonar',
            messages: [
                { role: 'system', content: 'Jesteś ekspertem od pamięci masowych. Zwracasz tylko JSON.' },
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
        console.error(`Błąd AI dla Dysku ${typeStr} ${capacity}:`, error.response?.data || error.message);
        return [];
    }
}

// PAMIĘTAJ O AKTUALIZACJI EXPORTU NA DOLE PLIKU:
module.exports = {
    fetchOffersFromAI,
    fetchMotherboardOffers,
    fetchRamOffers,
    fetchDiskOffers // <--- Nowa funkcja
};