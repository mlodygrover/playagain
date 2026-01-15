const jwt = require('jsonwebtoken');

// Middleware weryfikujący token i rolę admina
const protectAdmin = (req, res, next) => {
  let token;

  // 1. Sprawdzamy czy nagłówek Authorization istnieje i zaczyna się od "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Pobieramy sam token (odrzucamy słowo "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // Weryfikujemy token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 2. Sprawdzamy czy ID z tokena to ID Admina
      // decoded.id lub decoded.user._id zależy jak zapisałeś to przy logowaniu (sprawdź AuthController)
      const userId = decoded.id || decoded._id || decoded.user?._id;

      if (userId !== process.env.ADMIN_ID) {
        return res.status(403).json({ error: "Brak uprawnień administratora." });
      }

      // Jeśli wszystko OK, przepuszczamy dalej
      req.user = decoded;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: "Nieprawidłowy token, autoryzacja nieudana." });
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Brak tokena, autoryzacja wymagana." });
  }
};

module.exports = { protectAdmin };