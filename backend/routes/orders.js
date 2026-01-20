const router = require('express').Router();
const Order = require('../models/Order');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { protectAdmin } = require('../middleware/authMiddleware'); 
const verify = require('../middleware/auth');

// --- KONFIGURACJA TRANSPORTERA EMAIL (BREVO) ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: 587, // Port 587 jest standardem dla Brevo i STARTTLS
  secure: false, // WAŻNE: Dla portu 587 musi być false (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // --- USTAWIENIA DLA STABILNOŚCI ---
  tls: {
    ciphers: 'SSLv3', // Pomaga przy problemach z wersją szyfrowania
    rejectUnauthorized: false // Ignoruje błędy certyfikatów w dev/test
  },
  connectionTimeout: 10000, 
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

// Weryfikacja połączenia SMTP przy starcie
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Błąd połączenia SMTP (Orders):", error.message);
  } else {
    console.log("✅ Serwer SMTP gotowy do pracy (Orders).");
  }
});

// Funkcja pomocnicza do wysyłania maila
async function sendAdminNotification(order) {
  try {
    const mailOptions = {
      from: `"PlayAgain System" <${process.env.EMAIL_FROM}>`, 
      to: 'wiczjan@gmail.com', // Twój adres docelowy
      subject: `💰 Nowe opłacone zamówienie #${order._id.toString().slice(-6)}`,
      html: `
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
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Wysłano powiadomienie email. MessageID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Błąd wysyłania emaila:", error);
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

// 1. UTWÓRZ ZAMÓWIENIE I TRANSAKCJĘ TPAY
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
          sendAdminNotification(order);

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
router.put('/:id/status', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Nieprawidłowy status" });

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
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

module.exports = router;