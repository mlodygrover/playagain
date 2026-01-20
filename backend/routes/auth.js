const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const verify = require('../middleware/auth');

// --- KONFIGURACJA TRANSPORTERA EMAIL (BREVO - IDENTYCZNA JAK W ORDERS) ---
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: 587, // Port 587 jest standardem dla Brevo i STARTTLS
    secure: false, // WAŻNE: Dla portu 587 musi być false (STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    },
    connectionTimeout: 10000, 
    greetingTimeout: 5000,
    socketTimeout: 10000,
});

// Weryfikacja połączenia SMTP przy starcie
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Błąd połączenia SMTP (Auth):", error.message);
  } else {
    console.log("✅ Serwer SMTP gotowy do pracy (Auth).");
  }
});

// 1. REJESTRACJA (Z WYSYŁKĄ EMAILA)
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
        await transporter.sendMail({
            from: `"PlayAgain Team" <${process.env.EMAIL_FROM}>`, 
            to: email,
            subject: 'Weryfikacja konta PlayAgain',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                     <h1 style="color: #2563EB;">Witaj w PlayAgain! 🎮</h1>
                  </div>
                  <p>Dzięki za rejestrację. Aby aktywować konto i dokończyć konfigurację PC, kliknij poniżej:</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyLink}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                      Zweryfikuj Email
                    </a>
                  </div>
                  <p style="color: #666; font-size: 12px; text-align: center;">Jeśli to nie Ty zakładałeś konto, zignoruj tę wiadomość.</p>
                </div>
            `,
        });
        res.status(201).json({ message: "Rejestracja udana! Sprawdź skrzynkę email, aby aktywować konto." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd serwera przy rejestracji." });
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

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

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