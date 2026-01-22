const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const verify = require('../middleware/auth');

// --- FUNKCJA POMOCNICZA: WYSYŁANIE MAILA PRZEZ API BREVO ---
async function sendEmailViaApi(to, subject, htmlContent) {
    try {
        const apiKey = process.env.BREVO_API_KEY;
        
        // Sprawdź czy klucz istnieje
        if (!apiKey) {
            console.error("❌ BŁĄD: Brak BREVO_API_KEY w pliku .env");
            return;
        }

        // Adres nadawcy MUSI być zweryfikowany w Brevo!
        const senderEmail = process.env.EMAIL_FROM || "no-reply@playagain.store";
        const senderName = "PlayAgain Team";

        const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: senderName, email: senderEmail },
            to: [{ email: to }],
            subject: subject,
            htmlContent: htmlContent
        }, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            }
        });

        // Logujemy sukces wraz z ID wiadomości z Brevo - to dowód, że wyszło
        console.log(`✅ Brevo API Success: Email do ${to} przyjęty. MessageID: ${response.data.messageId}`);
    
    } catch (error) {
        console.error("❌ Błąd wysyłania emaila API:");
        if (error.response) {
            // Serwer odpowiedział kodem błędu (np. 400, 401)
            console.error("Status:", error.response.status);
            console.error("Dane:", JSON.stringify(error.response.data, null, 2));
        } else {
            // Błąd sieciowy
            console.error(error.message);
        }
    }
}

// 1. REJESTRACJA
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Ten email jest już zajęty." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verifyToken = crypto.randomBytes(32).toString('hex');

        const newUser = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            verificationToken: verifyToken,
            isVerified: false
        });
        await newUser.save();

        const verifyLink = `${process.env.BASE_URL}/verify?token=${verifyToken}`;

        // Wyślij Email
        await sendEmailViaApi(
            email,
            'Weryfikacja konta PlayAgain',
            `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #2563EB;">Witaj ${firstName}!</h2>
                <p>Dziękujemy za rejestrację. Aby aktywować konto, kliknij poniższy przycisk:</p>
                <div style="margin: 30px 0;">
                    <a href="${verifyLink}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Aktywuj Konto
                    </a>
                </div>
                <p style="color: #666; font-size: 12px;">Jeśli przycisk nie działa, wklej ten link do przeglądarki:<br>${verifyLink}</p>
            </div>
            `
        );

        res.status(201).json({ message: "Rejestracja udana! Sprawdź skrzynkę email." });

    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: "Błąd serwera." });
    }
});

// 2. WERYFIKACJA EMAILA
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "Brak tokena" });

        const user = await User.findOne({ verificationToken: token });
        if (!user) return res.status(400).json({ error: "Nieprawidłowy lub wygasły token." });

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ message: "Konto zweryfikowane pomyślnie! Możesz się zalogować." });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. LOGOWANIE
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Błędne dane logowania." });

        if (!user.isVerified) {
            return res.status(403).json({ error: "Konto nieaktywne. Sprawdź email i kliknij link weryfikacyjny." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Błędne dane logowania." });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.json({ token, user: { id: user._id, firstName: user.firstName, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/is-admin', verify, (req, res) => {
  try {
    const envAdminId = process.env.ADMIN_ID;
    const userId = req.user.id || req.user._id;

    if (envAdminId && userId === envAdminId) {
      return res.json({ isAdmin: true });
    } else {
      return res.json({ isAdmin: false });
    }
  } catch (err) {
    console.error("Błąd sprawdzania admina:", err);
    res.status(500).json({ isAdmin: false });
  }
});

module.exports = router;