// backend/services/allegroService.js
const axios = require('axios');

// Funkcja pomocnicza do kodowania Base64 (w Node.js nie trzeba 'btoa')
const getAuthHeader = () => {
  const credentials = `${process.env.ALLEGRO_CLIENT_ID}:${process.env.ALLEGRO_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

let cachedToken = null;

// 1. Pobieranie Tokena
async function getAccessToken() {
  if (cachedToken) return cachedToken;

  try {
    const res = await axios.post('https://allegro.pl/auth/oauth/token', 
      'grant_type=client_credentials', 
      {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    cachedToken = res.data.access_token;
    // Reset tokena po czasie wygaśnięcia (minus margines bezpieczeństwa)
    setTimeout(() => cachedToken = null, (res.data.expires_in - 60) * 1000); 
    return cachedToken;
  } catch (err) {
    console.error("Błąd auth Allegro:", err.response?.data || err.message);
    throw new Error("Nie udało się pobrać tokena Allegro");
  }
}

// 2. Wyszukiwanie (Zmodyfikowane pod Twoje wymagania)
async function searchAllegro(query, categoryId = '4226') {
  const token = await getAccessToken();

  try {
    const res = await axios.get(`https://api.allegro.pl/offers/listing`, {
      params: {
        phrase: query,
        'category.id': categoryId,     // Kategoria: Podzespoły komputerowe (lub inna podana)
        sort: '+price',                // Sortowanie: cena rosnąco (od najtańszych)
        limit: 10,                     // Pobierz 10 wyników
        'sellingMode.format': 'BUY_NOW' // Tylko Kup Teraz
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.allegro.public.v1+json'
      }
    });

    // Mapujemy tylko to co nas interesuje
    return res.data.items.regular.map(item => ({
      id: item.id,
      name: item.name,
      price: item.sellingMode.price.amount,
      currency: item.sellingMode.price.currency,
      url: `https://allegro.pl/oferta/${item.id}`,
      image: item.images[0]?.url,
      seller: item.seller.login
    }));

  } catch (err) {
    console.error("Błąd search Allegro:", err.response?.data || err.message);
    return []; // Zwracamy pustą tablicę w razie błędu
  }
}

module.exports = { searchAllegro };