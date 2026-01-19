const router = require('express').Router();
const { Component, Motherboard } = require('../models/Component');
const Offer = require('../models/Offer');

// Importujemy funkcje serwisu Perplexity
const {
  fetchOffersFromAI,
  fetchMotherboardOffers,
  fetchRamOffers,
  fetchDiskOffers
} = require('../services/perplexityService');

// Importujemy serwis eBay
const { fetchEbayOffers } = require('../services/ebayService');

const { updateComponentStats } = require('../utils/statsCalculator');
const { protectAdmin } = require('../middleware/authMiddleware');

const EBAY_CATEGORIES = {
  GPU: "27386",
  CPU: "164",
  Motherboard: "1244",
  RAM: "170083",
  Disk: "",
  PSU: "42017",
  Case: "42014",
  Cooling: "131486"
};

// ==========================================
// ROUTE 1: GENEROWANIE OFERT (AI + EBAY)
// ==========================================
router.post('/generate-ai-offers', protectAdmin, async (req, res) => {
  try {
    const { componentIds, ai = true } = req.body;

    if (!componentIds || !Array.isArray(componentIds)) {
      return res.status(400).json({ error: "Wymagana tablica componentIds" });
    }

    const results = { processed: 0, offersCreated: 0, errors: [] };

    for (const id of componentIds) {
      const component = await Component.findById(id);
      if (!component) continue;

      try {
        console.log(`🤖 Przetwarzanie: ${component.name} (${component.type})...`);
        if (ai === false) console.log(`   -> Tryb: TYLKO EBAY (AI pominięte)`);

        let aiOffers = [];
        let ebayOffers = [];

        // --- KROK 1: AI ---
        if (ai !== false) {
          try {
            // ... (Twoja logika AI bez zmian) ...
            if (component.type === 'Motherboard') {
              if (component.socket && component.formFactor) {
                aiOffers = await fetchMotherboardOffers(component.socket, component.formFactor);
              } else {
                aiOffers = await fetchOffersFromAI(component.searchQuery || component.name);
              }
            } else if (component.type === 'RAM') {
              const capacityParam = component.capacity ? `${component.capacity}GB` : null;
              aiOffers = await fetchRamOffers(capacityParam);
            } else if (component.type === 'Disk') {
              aiOffers = await fetchDiskOffers(component.diskType, component.interface, component.capacity);
            } else {
              aiOffers = await fetchOffersFromAI(component.searchQuery || component.name);
            }
            console.log(`   -> AI znalazło: ${aiOffers.length} ofert.`);
          } catch (aiError) {
            console.error(`   ⚠️ Błąd AI dla ${component.name}:`, aiError.message);
          }
        }

        // --- KROK 2: EBAY ---
        try {
          const categoryId = EBAY_CATEGORIES[component.type];

          if (fetchEbayOffers) {
            let ebayRaw = await fetchEbayOffers(component.searchQuery || component.name, categoryId, component.type == "Motherboard" || component.type == "Disk" ? true : false);

            if (ebayRaw.length === 0) {
              const EU_COUNTRIES_LIST = [
                "PL", "DE", "FR", "IT", "ES", "NL", "BE", "AT", "SE", "DK",
                "FI", "IE", "PT", "CZ", "GR", "HU", "RO", "SK", "BG", "HR",
                "SI", "LT", "LV", "EE", "LU", "CY", "MT"
              ].join("|");
              console.log(`   🔎 Pusto. Ponawiam szukanie (tryb forceNew) dla: ${component.name}`);
              ebayRaw = await fetchEbayOffers(component.searchQuery || component.name, categoryId, true, EU_COUNTRIES_LIST);
            }

            ebayOffers = ebayRaw.map(item => ({
              title: item.title,
              price: parseFloat(item.totalPrice || item.price),
              url: item.url,
              platform: "eBay",
              description: `Stan: ${item.condition} | Lokalizacja: ${item.location || 'PL'}`,
              externalId: `ebay-${item.id}`
            }));

            console.log(`   -> eBay znalazł: ${ebayOffers.length} ofert.`);
          }
        } catch (ebayError) {
          console.error(`   ⚠️ Błąd eBay dla ${component.name}:`, ebayError.message);
        }

        // --- KROK 3: ŁĄCZENIE I ZAPIS (ZMIENIONE NA UPSERT) ---

        // Filtrowanie niepoprawnych URL
        let allNewOffers = [...aiOffers, ...ebayOffers].filter(o => o.url && o.url.startsWith('http'));

        // Deduplikacja w pamięci (JS) - usuwa duplikaty w ramach TEGO zapytania
        const uniqueOffersMap = new Map();
        allNewOffers.forEach(offer => {
          const uniqueKey = `${offer.platform}-${offer.externalId}`;
          if (!uniqueOffersMap.has(uniqueKey)) {
            uniqueOffersMap.set(uniqueKey, offer);
          }
        });
        const uniqueOffers = Array.from(uniqueOffersMap.values());

        if (uniqueOffers.length > 0) {

          // A. CLEANUP (Sprzątanie)
          // Usuwamy z bazy oferty przypisane do TEGO komponentu, których NIE MA w nowym pobraniu.
          // Dzięki temu usuwamy "martwe" oferty (sprzedane/zakończone), ale nie dotykamy ofert innych komponentów.
          const newExternalIds = uniqueOffers.map(o => o.externalId);
          await Offer.deleteMany({
            componentId: component._id,
            externalId: { $nin: newExternalIds }
          });

          // B. BULK WRITE (UPSERT)
          // To jest klucz do sukcesu. Zamiast insertMany, przygotowujemy listę operacji.
          const bulkOps = uniqueOffers.map(offer => ({
            updateOne: {
              // Szukamy oferty po unikalnym ID i platformie
              filter: { platform: offer.platform, externalId: offer.externalId },
              // Ustawiamy nowe dane
              update: {
                $set: {
                  componentId: component._id, // Przypisujemy do aktualnego komponentu
                  title: offer.title || component.name,
                  price: offer.price,
                  url: offer.url,
                  description: offer.description || offer.specs || null,
                  isActive: true,
                  // Przekazujemy nowe dane do bazy
                  condition: offer.condition || "Used",
                  location: offer.location || "PL",
                  deliveryEstimation: offer.deliveryEstimation, // Zapisze datę z eBaya

                  updatedAt: new Date()
                }
              },
              // WAŻNE: Jeśli nie istnieje -> stwórz. Jeśli istnieje -> zaktualizuj.
              upsert: true
            }
          }));

          // Wykonujemy operacje w bazie
          const bulkRes = await Offer.bulkWrite(bulkOps);

          await updateComponentStats(component._id);

          const totalTouched = (bulkRes.upsertedCount || 0) + (bulkRes.modifiedCount || 0);
          console.log(`   ✅ BAZA ZSYNCHRONIZOWANA:`);
          console.log(`      - Dodano nowych: ${bulkRes.upsertedCount}`);
          console.log(`      - Zaktualizowano: ${bulkRes.modifiedCount}`);

          results.offersCreated += totalTouched;

        }

        results.processed++;

      } catch (err) {
        console.error(`❌ Krytyczny błąd przy ${component.name}:`, err.message);
        results.errors.push({ name: component.name, error: err.message });
      }
    }

    res.json({ message: "Proces zakończony", details: results });

  } catch (err) {
    console.error("Critical Admin Error:", err);
    res.status(500).json({ error: err.message });
  }
});
// ==========================================
// ROUTE: TWORZENIE SZABLONÓW PŁYT
// ==========================================
router.post('/create-mobo-templates', protectAdmin, async (req, res) => {
  try {
    const { socket } = req.body;
    if (!socket) return res.status(400).json({ error: "Brak podanego socketu." });

    const standards = ["ATX", "Micro-ATX", "Mini-ITX"];
    const created = [];

    for (const standard of standards) {
      const exists = await Component.findOne({ type: 'Motherboard', socket: socket, formFactor: standard });
      if (!exists) {
        const newMobo = new Motherboard({
          name: `${socket} ${standard}`,
          searchQuery: `Płyta główna ${socket} ${standard}`,
          type: "Motherboard",
          socket: socket,
          formFactor: standard,
          image: "",
          blacklistedKeywords: ["Uszkodzona", "Zestaw"]
        });
        await newMobo.save();
        created.push(newMobo);
      }
    }
    res.json({ message: `Utworzono ${created.length} szablonów.`, created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ROUTE: UPDATE ALL STATS
// ==========================================
router.post('/update-all-stats', protectAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    let filter = {};
    if (ids && Array.isArray(ids) && ids.length > 0) {
      filter = { _id: { $in: ids } };
      console.log(`🔄 Aktualizacja statystyk dla ${ids.length} wybranych komponentów...`);
    } else {
      console.log("🔄 Aktualizacja statystyk WSZYSTKICH komponentów...");
    }

    const components = await Component.find(filter, '_id name');
    const updatePromises = components.map(comp => updateComponentStats(comp._id));
    await Promise.all(updatePromises);

    res.json({ message: `Zaktualizowano statystyki dla ${components.length} komponentów.`, count: components.length });
  } catch (err) {
    console.error("❌ Błąd aktualizacji:", err);
    res.status(500).json({ error: "Błąd podczas aktualizacji." });
  }
});

module.exports = router;