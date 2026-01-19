const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importy tras
const adminRoute = require('./routes/admin');
const authRoute = require('./routes/auth');
const ordersRoute = require('./routes/orders');
const usersRoute = require('./routes/users');
const componentsRoute = require('./routes/components');
const chatRoutes = require('./routes/chatRoutes'); // <--- IMPORT
const app = express();
const prebuiltsRoutes = require('./routes/prebuilts');


// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json()); // Obsługa JSON (dla Frontendu)
app.use(express.urlencoded({ extended: true })); // Obsługa formularzy (dla Tpay)

// --- POŁĄCZENIE Z BAZĄ ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Połączono z MongoDB"))
    .catch((err) => console.log("❌ Błąd MongoDB:", err));

// --- TRASY (Tylko raz!) ---
app.use('/api/admin', adminRoute);
app.use('/api/auth', authRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/users', usersRoute);
app.use('/api/components', componentsRoute);
app.use('/api/ebay-test', require('./routes/ebayTest'));
app.use('/api/chat', chatRoutes); // <--- REJESTRACJA
app.use('/api/prebuilts', prebuiltsRoutes);
// Testowy route
app.get('/', (req, res) => {
    res.send('PlayAgain API is running...');
});

// --- START SERWERA ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serwer działa na porcie ${PORT}`);
});