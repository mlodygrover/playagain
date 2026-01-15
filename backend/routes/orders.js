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
// 2. WEBHOOK (Powiadomienia z Tpay)
router.post('/webhook/payment-update', async (req, res) => {
  try {
    // Logujemy, żeby widzieć w Renderze co przyszło
    console.log("🔔 Otrzymano webhook z Tpay. Body:", req.body);

    const { tr_status, tr_error, tr_crc, tr_id } = req.body;

    // Sprawdzamy czy płatność udana (TRUE) i brak błędu (none)
    if (tr_status === 'TRUE' && tr_error === 'none') {

      // Szukamy zamówienia po ID z pola CRC (to jest ID z MongoDB)
      // Używamy findById, bo w tr_crc wysłaliśmy savedOrder._id
      const order = await Order.findById(tr_crc);

      if (order) {
        // Zapisujemy paymentId teraz, na wypadek gdyby nie zapisało się przy tworzeniu
        if (!order.paymentId) {
          order.paymentId = tr_id;
        }

        if (order.status !== 'PAID') {
          order.status = 'PAID';
          order.paidAt = new Date();
          await order.save();
          console.log(`✅ Zamówienie ${order._id} zostało opłacone!`);
        } else {
          console.log(`ℹ️ Zamówienie ${order._id} było już opłacone wcześniej.`);
        }
      } else {
        console.error(`⚠️ Nie znaleziono zamówienia dla CRC: ${tr_crc}`);
      }
    }

    // Tpay musi dostać odpowiedź tekstową TRUE, inaczej będzie ponawiał próbę
    res.status(200).send('TRUE');
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    // W przypadku błędu serwera też lepiej oddać TRUE lub 200, żeby Tpay nie spamował,
    // chyba że chcesz, żeby próbował ponownie.
    res.status(500).send('FALSE');
  }
});
module.exports = router;