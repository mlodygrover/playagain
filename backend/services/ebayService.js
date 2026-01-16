const axios = require('axios');

// Konfiguracja z .env
const EBAY_APP_ID = process.env.EBAY_APP_ID;
const EBAY_CERT_ID = process.env.EBAY_CERT_ID;
// Zmień na 'SANDBOX' jeśli testujesz na kluczach sandboxowych, ale zalecane PRODUCTION
const EBAY_ENV = 'PRODUCTION'; 

// URL-e zależne od środowiska
const AUTH_URL = EBAY_ENV === 'PRODUCTION' 
  ? 'https://api.ebay.com/identity/v1/oauth2/token' 
  : 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';

const API_URL = EBAY_ENV === 'PRODUCTION'
  ? 'https://api.ebay.com/buy/browse/v1/item_summary/search'
  : 'https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search';

// Cache dla tokena (żeby nie pytać o niego przy każdym zapytaniu)
let cachedToken = null;
let tokenExpirationTime = 0;

/**
 * Pobiera token aplikacji (Client Credentials Grant)
 */
async function getEbayToken() {
  const now = Date.now();

  // Jeśli mamy ważny token, zwracamy go
  if (cachedToken && now < tokenExpirationTime) {
    return cachedToken;
  }

  try {
    const credentials = Buffer.from(`${EBAY_APP_ID}:${EBAY_CERT_ID}`).toString('base64');
    
    const response = await axios.post(AUTH_URL, 
      'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope', 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        }
      }
    );

    const { access_token, expires_in } = response.data;
    
    cachedToken = access_token;
    // Ustawiamy czas wygaśnięcia (np. 2 godziny) minus bufor bezpieczeństwa 2 minuty
    tokenExpirationTime = now + (expires_in * 1000) - 120000;

    return cachedToken;
  } catch (error) {
    console.error("❌ Błąd autoryzacji eBay:", error.response?.data || error.message);
    throw new Error("Nie udało się uzyskać tokena eBay");
  }
}

/**
 * Główna funkcja pobierająca oferty
 * @param {string} query - Fraza wyszukiwania (np. "RTX 3060")
 * @param {string} categoryId - ID kategorii eBay (np. "27386")
 * @returns {Promise<Array>} - Tablica sformatowanych ofert
 */
async function fetchEbayOffers(query, categoryId) {
  if (!query) return [];

  try {
    const token = await getEbayToken();

    // Filtry:
    // conditionIds:{1000|3000} -> Nowy (1000) lub Używany (3000)
    // buyingOptions:{FIXED_PRICE} -> Tylko Kup Teraz (bez licytacji)
    // itemLocationCountry:PL -> Towar fizycznie w Polsce
    const filter = 'conditionIds:{3000},buyingOptions:{FIXED_PRICE},itemLocationCountry:PL';

    const params = {
      q: query,
      category_ids: categoryId,
      limit: 7, // Pobieramy np. 5 najtańszych ofert, żeby nie śmiecić w bazie
      sort: 'price', // Sortowanie: Najniższa cena + wysyłka
      filter: filter
    };

    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_PL', // Kontekst Polski (waluta PLN)
        'Content-Type': 'application/json'
      },
      params: params
    });

    const items = response.data.itemSummaries || [];

    // Mapowanie wyników do formatu, którego oczekuje Twój router
    return items.map(item => {
      // Obliczanie ceny całkowitej (Cena przedmiotu + Koszt wysyłki)
      const itemPrice = parseFloat(item.price?.value || 0);
      const shippingCost = parseFloat(item.shippingOptions?.[0]?.shippingCost?.value || 0);
      const totalPrice = (itemPrice + shippingCost).toFixed(2);

      return {
        id: item.itemId,
        title: item.title,
        price: itemPrice, // Cena bazowa
        shippingCost: shippingCost,
        totalPrice: totalPrice, // Cena łączna (tę zapiszesz w bazie jako główną cenę)
        url: item.itemWebUrl,
        image: item.image ? item.image.imageUrl : null,
        condition: item.condition,
        location: item.itemLocation?.country || "PL"
      };
    });

  } catch (error) {
    // Jeśli nie znaleziono ofert, eBay czasem zwraca błąd, czasem pustą tablicę.
    // Logujemy błąd, ale nie wywalamy całej aplikacji.
    console.error(`⚠️ Błąd pobierania ofert eBay dla "${query}":`, error.response?.data?.error || error.message);
    return []; // Zwracamy pustą tablicę, żeby reszta logiki (np. AI) mogła działać
  }
}

module.exports = { fetchEbayOffers };