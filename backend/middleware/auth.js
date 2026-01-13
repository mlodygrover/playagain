const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Pobierz token z nagłówka (Format: "Bearer TOKEN")
  const token = req.header('Authorization');

  if (!token) return res.status(401).json({ error: "Brak dostępu. Wymagane logowanie." });

  try {
    // 2. Usuń słowo "Bearer " jeśli istnieje i zweryfikuj
    const tokenString = token.replace("Bearer ", "");
    const verified = jwt.verify(tokenString, process.env.JWT_SECRET);
    
    // 3. Dodaj dane użytkownika (id) do obiektu req
    req.user = verified;
    next(); // Przejdź dalej
  } catch (err) {
    res.status(400).json({ error: "Nieprawidłowy token." });
  }
};