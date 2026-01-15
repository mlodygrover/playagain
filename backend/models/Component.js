const mongoose = require('mongoose');

const options = { discriminatorKey: 'type', collection: 'components' };

// --- BASE COMPONENT ---
const ComponentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String },
    searchQuery: { type: String, required: true },
    blacklistedKeywords: [{ type: String }],

    stats: {
        averagePrice: { type: Number, default: 0 },
        lowestPrice: { type: Number, default: 0 },
        highestPrice: { type: Number, default: 0 }, // Dodane dla pełnego obrazu
        standardDeviation: { type: Number, default: 0 }, // <--- TWOJE NOWE POLE
        offersCount: { type: Number, default: 0 },
        lastUpdate: { type: Date }
    }
}, options);

const Component = mongoose.model('Component', ComponentSchema);

// --- ISTNIEJĄCE ---
const GPU = Component.discriminator('GPU', new mongoose.Schema({
    chipset: String, model: String, vram: Number, memoryType: String
}));

const CPU = Component.discriminator('CPU', new mongoose.Schema({
    socket: String, cores: Number, threads: Number, baseClock: Number
}));

const Motherboard = Component.discriminator('Motherboard', new mongoose.Schema({
    socket: String, chipset: String, formFactor: String, memoryType: String
}));

const RAM = Component.discriminator('RAM', new mongoose.Schema({
    memoryType: String, capacity: Number, modules: Number, speed: Number, latency: String
}));

// --- NOWE MODELE ---

// 1. Dysk (Disk)
const DiskSchema = new mongoose.Schema({
    diskType: { type: String, enum: ['SSD', 'HDD'] },
    interface: { type: String }, // np. "M.2 NVMe", "SATA III"
    capacity: { type: Number },  // w GB
    format: { type: String }     // np. "M.2 2280", "2.5 cala", "3.5 cala"
});
const Disk = Component.discriminator('Disk', DiskSchema);

// 2. Obudowa (Case)
const CaseSchema = new mongoose.Schema({
    caseType: { type: String },    // np. "Midi Tower", "Mini Tower"
    standard: { type: String },    // Maksymalny format płyty, np. "ATX"
    hasWindow: { type: Boolean },  // Czy ma okno?
    maxGpuLength: { type: Number } // Maksymalna długość karty w mm
});
const Case = Component.discriminator('Case', CaseSchema);

// 3. Zasilacz (PSU)
const PSUSchema = new mongoose.Schema({
    power: { type: Number },       // Moc w Watach
    certification: { type: String }, // np. "80 Plus Gold", "Brak"
    modular: { type: String },     // "Pełne", "Częściowe", "Nie"
    standard: { type: String }     // "ATX", "SFX"
});
const PSU = Component.discriminator('PSU', PSUSchema);

// 4. Chłodzenie CPU (Cooling)
const CoolingSchema = new mongoose.Schema({
    coolingType: { type: String, enum: ['Air', 'AIO', 'Custom'] }, // Powietrzne / Wodne
    socket: { type: String },      // Kompatybilność (można zrobić tablicę stringów w przyszłości)
    fanSize: { type: Number },     // Rozmiar wentylatora (mm)
    height: { type: Number },      // Wysokość (mm) - ważne żeby weszło do obudowy
    radiatorSize: { type: Number } // Dla AIO: 240, 360 itd.
});
const Cooling = Component.discriminator('Cooling', CoolingSchema);

module.exports = { Component, GPU, CPU, Motherboard, RAM, Disk, Case, PSU, Cooling };