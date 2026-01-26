const router = require('express').Router();
const Order = require('../models/Order');
const axios = require('axios');
const { protectAdmin } = require('../middleware/authMiddleware');
const verify = require('../middleware/auth');
const Return = require('../models/Return');
const jwt = require('jsonwebtoken');
// --- POWIADOMIENIE 1: POTWIERDZENIE ZŁOŻENIA ZAMÓWIENIA (PENDING) ---
async function sendOrderConfirmation(order) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return;

    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: "PlayAgain Store", email: process.env.EMAIL_FROM || "no-reply@playagain.store" },
      to: [{ email: order.customerDetails.email, name: order.customerDetails.firstName }],
      subject: `🎮 Twoje zamówienie #${order._id.toString().slice(-6)} zostało przyjęte!`,
      htmlContent: `
        <div style="background-color: #000; padding: 40px; font-family: sans-serif; color: #fff; max-width: 600px; margin: auto; border: 1px solid #333;">
          <h1 style="color: #2563eb; text-transform: uppercase; letter-spacing: 2px;">Przyjęliśmy zamówienie!</h1>
          <p style="color: #999; font-size: 16px;">Witaj ${order.customerDetails.firstName}, dziękujemy za zaufanie. Twoje zamówienie oczekuje na płatność.</p>
          <div style="background: #111; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Kwota do zapłaty:</strong> ${order.totalAmount} PLN</p>
            <p style="margin: 5px 0;"><strong>Numer zamówienia:</strong> #${order._id}</p>
          </div>
          <p style="font-size: 12px; color: #555;">Jeśli płatność nie została dokończona, możesz to zrobić w zakładce profilu lub przez link w przeglądarce.</p>
          <hr style="border: 0; border-top: 1px solid #333; margin: 30px 0;">
          <p style="text-align: center; color: #2563eb; font-weight: bold;">PlayAgain Store - Level Up Your Gear</p>
        </div>
      `
    }, { headers: { 'api-key': apiKey, 'Content-Type': 'application/json' } });
  } catch (error) { console.error("Błąd maila potwierdzającego:", error.message); }
}

// --- POWIADOMIENIE 2: POTWIERDZENIE PŁATNOŚCI + LINK DO ZWROTU ---
// --- POWIADOMIENIE 2: POTWIERDZENIE PŁATNOŚCI + LINKI DO ZAMÓWIENIA I ZWROTU ---
async function sendPaymentSuccessNotification(order) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return;

    const mainOrderId = order._id.toString();

    // Generujemy oba linki
    const orderLink = `${process.env.BASE_URL}/zamowienie/${mainOrderId}`;
    const returnLink = `${process.env.BASE_URL}/returns/${mainOrderId}`;

    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: "PlayAgain Store", email: process.env.EMAIL_FROM || "no-reply@playagain.store" },
      to: [{
        email: order.customerDetails.email,
        name: `${order.customerDetails.firstName}`
      }],
      subject: `✅ Płatność otrzymana! Zamówienie #${mainOrderId.slice(-6)}`,
      htmlContent: `
        <div style="background-color: #000; padding: 40px; font-family: sans-serif; color: #fff; max-width: 600px; margin: auto; border: 1px solid #333;">
          <h1 style="color: #22c55e; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">Zapłacone!</h1>
          <p style="color: #999; font-size: 16px; line-height: 1.5;">Witaj ${order.customerDetails.firstName}, Twoja wpłata została zaksięgowana. Przystępujemy do realizacji zamówienia.</p>
          
          <div style="background: #111; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #22c55e;">
             <p style="margin: 0; font-size: 14px;">Status: <strong style="color: #22c55e;">OPŁACONE</strong></p>
             <p style="margin: 5px 0 0 0; font-size: 14px;">Kwota: <strong>${order.totalAmount} PLN</strong></p>
             <p style="margin: 5px 0 0 0; font-size: 14px;">Numer: <strong>#${mainOrderId}</strong></p>
          </div>

          <p style="color: #fff; font-weight: bold; margin-top: 30px; margin-bottom: 15px;">Zarządzaj swoim zamówieniem:</p>
          
          <div style="margin-bottom: 30px;">
            <a href="${orderLink}" style="background-color: #ffffff; color: #000000; padding: 12px 20px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; font-size: 12px; display: inline-block; margin-right: 10px; margin-bottom: 10px;">Podgląd zamówienia</a>
            
            <a href="${returnLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 20px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; font-size: 12px; display: inline-block;">Zwroty i Reklamacje</a>
          </div>

          <hr style="border: 0; border-top: 1px solid #333; margin: 30px 0;">
          
          <p style="color: #666; font-size: 13px; line-height: 1.4;">
            Pamiętaj, że masz 14 dni na odstąpienie od umowy bez podania przyczyny. 
            Gdy tylko wyślemy Twoją paczkę, otrzymasz kolejną wiadomość z linkiem do śledzenia.
          </p>

          <p style="font-size: 11px; color: #444; text-align: center; margin-top: 40px;">Wiadomość wygenerowana automatycznie przez PlayAgain Store.</p>
        </div>
      `
    }, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log(`📧 Mail z linkami wysłany poprawnie dla zamówienia: ${mainOrderId}`);

  } catch (error) {
    console.error("❌ Błąd maila o płatności:", error.response?.data || error.message);
  }
}
// --- FUNKCJA POMOCNICZA: POWIADOMIENIE ADMINA PRZEZ API BREVO ---
async function sendAdminNotification(order) {
  try {
    const apiKey = process.env.BREVO_API_KEY;

    // Sprawdzenie czy klucz istnieje
    if (!apiKey) {
      console.error("❌ BŁĄD: Brak BREVO_API_KEY w pliku .env");
      return;
    }

    const senderEmail = process.env.EMAIL_FROM || "no-reply@playagain.store";
    const senderName = "PlayAgain System";

    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: "wiczjan@gmail.com", name: "Administrator" }],
      subject: `💰 Nowe opłacone zamówienie #${order._id.toString().slice(-6)}`,
      htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">Otrzymano nową płatność!</h2>
            <p><strong>Numer zamówienia:</strong> ${order._id}</p>
            <p><strong>Klient:</strong> ${order.customerDetails.firstName} ${order.customerDetails.lastName}</p>
            <p><strong>Email klienta:</strong> ${order.customerDetails.email}</p>
            <p><strong>Kwota:</strong> <span style="font-size: 1.2em; font-weight: bold;">${order.totalAmount} PLN</span></p>
            <p><strong>Status:</strong> <span style="color: green; font-weight: bold;">OPŁACONE (PAID)</span></p>
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.9em; color: #666;">Wiadomość wygenerowana automatycznie przez system PlayAgain.</p>
          </div>
        `
    }, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    });

    console.log(`📧 Admin powiadomiony. ID wiadomości: ${response.data.messageId}`);

  } catch (error) {
    console.error("❌ Błąd wysyłania emaila do admina (API):");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Dane:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

// Funkcja pomocnicza do pobierania Tokena Tpay
async function getTpayToken() {
  try {
    const res = await axios.post(`${process.env.TPAY_API_URL}/oauth/auth`, {
      client_id: process.env.TPAY_CLIENT_ID,
      client_secret: process.env.TPAY_CLIENT_SECRET
    });
    return res.data.access_token;
  } catch (error) {
    console.error("Błąd autoryzacji Tpay:", error.response?.data || error.message);
    throw new Error("Nie udało się połączyć z bramką płatności.");
  }
}

// FUNKCJA POMOCNICZA DO TWORZENIA ZWROTU
// POPRAWIONA FUNKCJA W orders.js
async function createInitialReturn(orderId, userId) {
  try {
    const newReturn = new Return({
      order: orderId,
      user: userId || null, // Teraz zezwalamy na null (gość)
      status: 'NONE'
    });
    await newReturn.save();
    console.log(`📦 Utworzono model zwrotu dla ${userId ? 'Użytkownika' : 'Gościa'}`);
  } catch (err) {
    console.error("❌ Błąd zwrotu:", err.message);
  }
}

// MODYFIKACJA ROUTE POST / (Tworzenie zamówienia)
router.post('/', async (req, res) => {
  try {
    const { customerDetails, items, totalAmount, userId } = req.body;

    const newOrder = new Order({
      user: userId || null,
      customerDetails,
      items,
      totalAmount,
      status: 'PENDING'
    });
    const savedOrder = await newOrder.save();

    // --- POPRAWKA: Tworzymy zwrot dla KAŻDEGO zamówienia (User i Gość) ---
    await createInitialReturn(savedOrder._id, userId || null);
    // --------------------------------------------------------------------
    // WYWOŁANIE MAILA POTWIERDZAJĄCEGO
    await sendOrderConfirmation(savedOrder);

    const accessToken = await getTpayToken();

    const transactionRes = await axios.post(
      `${process.env.TPAY_API_URL}/transactions`,
      {
        amount: totalAmount,
        description: `Zamówienie #${savedOrder._id}`,
        hiddenDescription: savedOrder._id.toString(),
        payer: {
          email: customerDetails.email,
          name: `${customerDetails.firstName} ${customerDetails.lastName}`,
          address: customerDetails.address,
          city: customerDetails.city,
          code: customerDetails.zipCode,
        },
        callbacks: {
          payerUrls: {
            success: `${process.env.BASE_URL}/sukces?orderId=${savedOrder._id}`,
            error: `${process.env.BASE_URL}/koszyk?error=payment_failed`
          },
          notification: {
            url: `${process.env.NOTIFICATION_URL}/api/orders/webhook/payment-update`,
            email: customerDetails.email
          }
        }
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    savedOrder.paymentId = transactionRes.data.transactionId;
    await savedOrder.save();

    res.status(201).json({
      message: "Zamówienie utworzone",
      orderId: savedOrder._id,
      paymentUrl: transactionRes.data.transactionPaymentUrl
    });

  } catch (err) {
    console.error("Order Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Błąd podczas tworzenia płatności." });
  }
});

// 2. WEBHOOK (Powiadomienia z Tpay)
router.post('/webhook/payment-update', async (req, res) => {
  try {
    console.log("🔔 Otrzymano webhook z Tpay. Body:", req.body);
    const { tr_status, tr_error, tr_crc, tr_id } = req.body;

    if (tr_status === 'TRUE' && tr_error === 'none') {
      const order = await Order.findById(tr_crc);

      if (order) {
        if (!order.paymentId) {
          order.paymentId = tr_id;
        }

        if (order.status !== 'PAID') {
          order.status = 'PAID';
          order.paidAt = new Date();
          await order.save();

          console.log(`✅ Zamówienie ${order._id} zostało opłacone.`);

          await sendPaymentSuccessNotification(order);
          // Wysyłka maila do admina przez API Brevo
          await sendAdminNotification(order);

        } else {
          console.log(`ℹ️ Zamówienie ${order._id} było już opłacone wcześniej.`);
        }
      } else {
        console.error(`⚠️ Nie znaleziono zamówienia dla CRC: ${tr_crc}`);
      }
    }
    res.status(200).send('TRUE');
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    res.status(500).send('FALSE');
  }
});

// GET /api/orders/my-orders
router.get('/my-orders', verify, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Nie udało się pobrać historii zamówień." });
  }
});

// GET /api/orders/all
router.get('/all', protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status
// routes/orders.js

// Zaktualizowany endpoint statusu i linku trackingu
router.put('/:id/status', protectAdmin, async (req, res) => {
  try {
    const { status, trackingLink } = req.body; // Przyjmujemy też trackingLink

    const updateData = {};
    if (status) updateData.status = status;
    if (trackingLink !== undefined) updateData.trackingLink = trackingLink;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Nie znaleziono zamówienia" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/orders/:id
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Zamówienie nie zostało znalezione." });
    res.json({ message: "Zamówienie zostało trwale usunięte." });
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera podczas usuwania." });
  }
});
// GET /api/orders/:id - Pobieranie pojedynczego zamówienia
// ZMIENIONY ENDPOINT: Usunęliśmy 'verify' z parametrów, aby goście mogli tu wejść
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Nie znaleziono zamówienia." });
    }

    // --- LOGIKA SMART AUTH ---

    // Jeśli zamówienie ma przypisanego użytkownika (nie jest zamówieniem gościa)
    if (order.user) {
      const authHeader = req.header('Authorization');
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: "To zamówienie jest przypisane do konta. Zaloguj się, aby je zobaczyć." });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Sprawdzamy czy zalogowany to właściciel lub admin
        const isOwner = decoded.id === order.user.toString();
        const isAdmin = decoded.isAdmin;

        if (!isOwner && !isAdmin) {
          return res.status(403).json({ error: "Brak uprawnień do podglądu tego zamówienia." });
        }
      } catch (err) {
        return res.status(401).json({ error: "Sesja wygasła lub token jest nieprawidłowy." });
      }
    }

    // Jeśli zamówienie NIE ma przypisanego usera (gość) LUB autoryzacja powyżej przeszła:
    res.json(order);

  } catch (err) {
    console.error("Błąd pobierania zamówienia:", err);
    res.status(500).json({ error: "Błąd serwera podczas pobierania zamówienia." });
  }
});
module.exports = router;