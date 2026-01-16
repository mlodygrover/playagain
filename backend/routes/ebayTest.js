// backend/routes/ebayTest.js
const router = require('express').Router();
const axios = require('axios');

// Konfiguracja (możesz to przenieść do .env)
const EBAY_CLIENT_ID = process.env.EBAY_APP_ID;
const EBAY_CLIENT_SECRET = process.env.EBAY_CERT_ID;
const EBAY_ENV = 'PRODUCTION'; // lub 'SANDBOX'

// URL zależny od środowiska
const AUTH_URL = EBAY_ENV === 'PRODUCTION'
    ? 'https://api.ebay.com/identity/v1/oauth2/token'
    : 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';

const API_URL = EBAY_ENV === 'PRODUCTION'
    ? 'https://api.ebay.com/buy/browse/v1/item_summary/search'
    : 'https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search';

// Funkcja pomocnicza do pobierania tokena (w produkcji warto go cache'ować!)
async function getEbayToken() {
    const credentials = Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(AUTH_URL,
        'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`
            }
        }
    );
    return response.data.access_token;
}

// === GŁÓWNY ENDPOINT TESTOWY ===
router.post('/search', async (req, res) => {
    try {
        // Pobieramy parametry z frontendu (możesz dodać zipCode jeśli chcesz precyzję wysyłki)
        const { query, categoryId, limit = 20 } = req.body;

        if (!query) {
            return res.status(400).json({ error: "Brak frazy wyszukiwania" });
        }

        console.log(`🔍 Szukam PL: "${query}" (Nowe/Używane, Najtaniej z wysyłką)`);

        const token = await getEbayToken();

        // 1. Budowanie Filtrów
        // conditionIds:{1000|3000} -> Nowy (1000) LUB Używany (3000)
        // itemLocationCountry:PL -> Tylko przedmioty znajdujące się w Polsce
        // buyingOptions:{FIXED_PRICE} -> Tylko "Kup Teraz" (bez licytacji, opcjonalne, ale bezpieczniejsze dla sklepu)

        let filterString = 'conditionIds:{1000|3000},itemLocationCountry:PL,buyingOptions:{FIXED_PRICE}';

        // 2. Parametry zapytania
        const params = {
            q: query,
            limit: limit,
            sort: 'price', // To odpowiada _sop=15 (Price + Shipping: Lowest)
            filter: filterString
        };

        // Opcjonalnie: Dodaj kategorię jeśli jest podana (np. 27386 dla GPU)
        if (categoryId) {
            params.category_ids = categoryId;
        }

        const response = await axios.get(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                // WAŻNE: To ustawia kontekst na eBay Polska (waluta PLN, język PL)
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_PL',
                // Opcjonalnie: Precyzyjne wyliczanie kosztów wysyłki dla konkretnego kodu pocztowego (np. Poznań)
                // 'X-EBAY-C-ENDUSERCTX': 'affiliateCampaignId=<twoje_id>,contextualLocation=country=<PL>,zip=<61-896>' 
                'Content-Type': 'application/json'
            },
            params: params
        });

        const items = response.data.itemSummaries || [];

        // Mapowanie wyników
        const formattedItems = items.map(item => ({
            id: item.itemId,
            title: item.title,
            // Cena przedmiotu
            price: item.price.value,
            currency: item.price.currency,
            // Koszt wysyłki (może być 0 lub undefined)
            shippingCost: item.shippingOptions?.[0]?.shippingCost?.value || "0.00",
            // Łączna cena (dla Twojej wygody w sortowaniu/wyświetlaniu)
            totalPrice: (parseFloat(item.price.value) + parseFloat(item.shippingOptions?.[0]?.shippingCost?.value || 0)).toFixed(2),
            image: item.image ? item.image.imageUrl : null,
            url: item.itemWebUrl,
            condition: item.condition,
            location: item.itemLocation?.country || "N/A"
        }));

        res.json({ count: response.data.total, items: formattedItems });

    } catch (error) {
        console.error("Błąd eBay API:", error.response?.data || error.message);
        res.status(500).json({ error: "Błąd API", details: error.response?.data });
    }
});

module.exports = router;