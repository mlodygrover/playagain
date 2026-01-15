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

    // SCENARIUSZ A: Brak ofert (np. wszystkie usunięto)
    if (offers.length === 0) {
      await Component.findByIdAndUpdate(componentId, {
        stats: {
          averagePrice: 0,
          lowestPrice: 0,
          highestPrice: 0,
          standardDeviation: 0,
          offersCount: 0,
          lastUpdate: now
        }
      });
      console.log(`📉 Wyzerowano statystyki dla ID: ${componentId}`);
      return;
    }

    // SCENARIUSZ B: Są oferty - liczymy matematykę
    const prices = offers.map(o => o.price);
    
    // 1. Podstawowe
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / prices.length;

    // 2. Odchylenie Standardowe (Population Standard Deviation)
    // Wzór: pierwiastek ze średniej kwadratów różnic od średniej
    const squareDiffs = prices.map(price => {
      const diff = price - avg;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / prices.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    // 3. Aktualizacja w bazie (zaokrąglamy do 2 miejsc po przecinku)
    await Component.findByIdAndUpdate(componentId, {
      stats: {
        averagePrice: parseFloat(avg.toFixed(2)),
        lowestPrice: min,
        highestPrice: max,
        standardDeviation: parseFloat(stdDev.toFixed(2)),
        offersCount: offers.length,
        lastUpdate: now
      }
    });

    console.log(`📊 Zaktualizowano statystyki dla ID: ${componentId} | Średnia: ${avg.toFixed(2)} | Odchylenie: ${stdDev.toFixed(2)}`);

  } catch (err) {
    console.error("❌ Błąd podczas aktualizacji statystyk:", err);
  }
}

module.exports = { updateComponentStats };