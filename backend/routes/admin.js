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

    const results = {
      processed: 0,
      offersCreated: 0,
      errors: []
    };

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
          
          if (categoryId && fetchEbayOffers) {
            // fetchEbayOffers zwraca już obiekty z polem 'url' (nie itemWebUrl)
            const ebayRaw = await fetchEbayOffers(component.searchQuery || component.name, categoryId);
            
            ebayOffers = ebayRaw.map(item => ({
              title: item.title,
              price: parseFloat(item.totalPrice || item.price),
              url: item.url, // <--- POPRAWKA: Tutaj był błąd (item.itemWebUrl -> item.url)
              platform: "eBay",
              description: `Stan: ${item.condition} | Lokalizacja: ${item.location || 'PL'}`,
              externalId: `ebay-${item.id}`
            }));
            
            console.log(`   -> eBay znalazł: ${ebayOffers.length} ofert.`);
          }
        } catch (ebayError) {
          console.error(`   ⚠️ Błąd eBay dla ${component.name}:`, ebayError.message);
        }

        // --- KROK 3: ŁĄCZENIE I ZAPIS ---
        // Dodajemy filtr .filter(o => o.url), aby usunąć ewentualne wadliwe oferty
        const allNewOffers = [...aiOffers, ...ebayOffers].filter(o => o.url && o.url.startsWith('http'));

        if (allNewOffers.length > 0) {
          await Offer.deleteMany({ componentId: component._id });

          const offersToSave = allNewOffers.map(offer => ({
            componentId: component._id,
            title: offer.title || component.name,
            price: offer.price,
            url: offer.url,
            platform: offer.platform || "Web",
            description: offer.description || offer.specs || null,
            externalId: offer.externalId || `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            isActive: true
          }));

          await Offer.insertMany(offersToSave);
          await updateComponentStats(component._id);
          console.log(`   ✅ ZAKTUALIZOWANO BAZĘ: ${offersToSave.length} ofert.`);
          results.offersCreated += offersToSave.length;

        } else {
          console.log(`   ⛔ BRAK NOWYCH OFERT. Stare oferty zostały zachowane.`);
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