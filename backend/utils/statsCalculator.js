const { Component } = require('../models/Component'); // Importujemy bazowy model
const Offer = require('../models/Offer');

async function updateComponentStats(componentId) {
    try {
        // 1. Pobierz tylko AKTYWNE oferty
        const offers = await Offer.find({
            componentId: componentId,
            isActive: true
        });

        const now = new Date();
        
        // SCENARIUSZ A: Brak ofert (wyzerowanie)
        if (offers.length === 0) {
            await Component.findByIdAndUpdate(componentId, {
                stats: {
                    averagePrice: 0,
                    lowestPrice: 0,
                    highestPrice: 0,
                    basePrice: 0, // <--- Zerujemy też basePrice
                    standardDeviation: 0,
                    offersCount: 0,
                    lastUpdate: now
                }
            });
            console.log(`📉 Wyzerowano statystyki dla ID: ${componentId}`);
            return;
        }

        // SCENARIUSZ B: Są oferty - liczymy matematykę

        // KROK 1: Przygotowanie posortowanej tablicy cen (niezbędne do kwartyli)
        // Uwaga: .sort() domyślnie sortuje jako stringi, dlatego (a,b) => a-b
        const prices = offers.map(o => o.price).sort((a, b) => a - b);

        // KROK 2: Podstawowe statystyki
        const min = prices[0]; // Pierwszy element po posortowaniu to min
        const max = prices[prices.length - 1]; // Ostatni to max
        const sum = prices.reduce((a, b) => a + b, 0);
        const avg = sum / prices.length;

        // KROK 3: Obliczanie 1. kwartyla (Q1 - 25. percentyl)
        // To cena, od której 25% ofert jest tańszych, a 75% droższych
        const q1Index = Math.floor((prices.length - 1) * 0.45);
        const firstQuartile = prices[q1Index];

        // KROK 4: Znalezienie najniższej ceny na eBay
        // Filtrujemy oferty, gdzie platforma to "eBay" (zgodnie z Twoim zapisem w routerze)
        const ebayOffers = offers.filter(o => o.platform === 'eBay');

        // Jeśli są oferty z eBay, bierzemy najniższą, jeśli nie - Infinity
        const minEbayPrice = ebayOffers.length > 0
            ? Math.min(...ebayOffers.map(o => o.price))
            : Infinity;

        // KROK 5: Wyznaczenie basePrice
        // Minimum z: (Najniższy eBay) LUB (1. Kwartyl wszystkich)
        let basePrice = firstQuartile;

        // Jeśli mamy ofertę z eBay i jest ona tańsza niż 1. kwartyl całego rynku, używamy jej
        if (minEbayPrice !== Infinity) {
            basePrice = Math.min(minEbayPrice, firstQuartile);
        }

        // KROK 6: Odchylenie Standardowe
        const squareDiffs = prices.map(price => {
            const diff = price - avg;
            return diff * diff;
        });
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / prices.length;
        const stdDev = Math.sqrt(avgSquareDiff);

        // KROK 7: Aktualizacja w bazie
        await Component.findByIdAndUpdate(componentId, {
            stats: {
                averagePrice: parseFloat(avg.toFixed(2)),
                lowestPrice: min,
                highestPrice: max,
                basePrice: Math.ceil(11*parseFloat(basePrice.toFixed(2))/10), // <--- Zapisujemy wyliczoną cenę bazową
                standardDeviation: parseFloat(stdDev.toFixed(2)),
                offersCount: offers.length,
                lastUpdate: now
            }
        });

        console.log(`📊 Stats ID: ${componentId} | Avg: ${avg.toFixed(0)} | Q1: ${firstQuartile} | eBayMin: ${minEbayPrice === Infinity ? 'BRAK' : minEbayPrice} | Base: ${basePrice.toFixed(0)}`);

    } catch (err) {
        console.error("❌ Błąd podczas aktualizacji statystyk:", err);
    }
}

module.exports = { updateComponentStats };
