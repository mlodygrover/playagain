const router = require('express').Router();
const Order = require('../models/Order');
const axios = require('axios');
const verify = require('../middleware/auth'); // Opcjonalnie, jeśli chcesz chronić endpoint

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

    // 1. Zapisz zamówienie w bazie (Status: PENDING)
    const newOrder = new Order({
      user: userId || null,
      customerDetails,
      items,
      totalAmount,
      status: 'PENDING'
    });
    const savedOrder = await newOrder.save();

    // 2. Pobierz token Tpay
    const accessToken = await getTpayToken();

    // 3. Utwórz transakcję w Tpay
    // 3. Utwórz transakcję w Tpay
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
          // TU NIE DAJEMY URLS! Tpay ignoruje je tutaj w nowym API.
        },

        callbacks: {
          // TUTAJ JEST POPRAWNE MIEJSCE:
          payerUrls: {
            success: `${process.env.BASE_URL}/sukces?orderId=${savedOrder._id}`,
            error: `${process.env.BASE_URL}/koszyk?error=payment_failed`
          },
          notification: {
            // Adres, na który Tpay wyśle potwierdzenie w tle
            url: `${process.env.NOTIFICATION_URL}/api/orders/webhook/payment-update`,
            email: customerDetails.email
          }
        }
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // 4. Zapisz ID transakcji Tpay w bazie (opcjonalnie)
    savedOrder.paymentId = transactionRes.data.transactionId;
    await savedOrder.save();

    // 5. Zwróć link do płatności do Frontendu
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
// backend/routes/orders.js

router.post('/webhook/payment-update', async (req, res) => {
  try {
    console.log("🔔 Otrzymano webhook z Tpay:", req.body);

    const { tr_status, tr_id, tr_error, tr_crc } = req.body;

    if (tr_status === 'TRUE' && tr_error === 'none') {

      // Próbujemy znaleźć zamówienie na dwa sposoby:
      // 1. Po ID transakcji Tpay (jeśli zapisaliśmy je w bazie przy tworzeniu)
      let order = await Order.findOne({ paymentId: tr_id });

      // 2. Jeśli nie znaleziono, szukamy po ID zamówienia (często przekazywane w tr_crc lub hiddenDescription)
      // Uwaga: Tpay czasem zwraca ID zamówienia w polu tr_crc jeśli tak skonfigurowaliśmy w panelu, 
      // ale w naszym kodzie API nie wysłaliśmy crc. 
      // W poprzednim kroku wysłaliśmy 'hiddenDescription', ale webhook rzadko je zwraca wprost.

      // NAJLEPSZA METODA: 
      // W kroku 1 (tworzenie) upewnij się, że zapisałeś: savedOrder.paymentId = transactionRes.data.transactionId;

      if (order) {
        if (order.status !== 'PAID') {
          order.status = 'PAID';
          order.paidAt = new Date();
          await order.save();
          console.log(`✅ Zamówienie ${order._id} opłacone!`);
        }
      } else {
        console.error(`⚠️ Nie znaleziono zamówienia dla transakcji Tpay: ${tr_id}`);
      }
    }

    res.status(200).send('TRUE');
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    res.status(500).send('FALSE');
  }
});
module.exports = router;