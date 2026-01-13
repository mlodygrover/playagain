const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoute = require('./routes/auth');
const ordersRoute = require('./routes/orders');
const usersRoute = require('./routes/users'); // <--- NOWY
const app = express();

// Middleware
app.use(cors()); // Pozwala frontendowi (port 3000) gadać z backendem (port 5000)
app.use(express.json());

// Połączenie z bazą
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Połączono z MongoDB"))
    .catch((err) => console.log("❌ Błąd MongoDB:", err));

// Trasy
app.use('/api/auth', authRoute);
app.use('/api/orders', ordersRoute);

// Testowy route
app.get('/', (req, res) => {
    res.send('PlayAgain API is running...');
});

app.use('/api/auth', authRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/users', usersRoute); // <--- NOWY
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serwer działa na porcie ${PORT}`);
});