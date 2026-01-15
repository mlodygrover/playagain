module.exports = function (req, res, next) {
  // 1. Pobierz ID admina z pliku .env
  const envAdminId = process.env.ADMIN_ID;

  // 2. Pobierz ID zalogowanego usera z tokena (req.user dodaje middleware 'verify')
  // Z Twoich logów wynika, że w tokenie masz pole 'id', a nie '_id'
  const userId = req.user.id || req.user._id; 

  // 3. Porównanie
  // Sprawdzamy czy ADMIN_ID jest ustawione ORAZ czy pasuje do usera
  if (!envAdminId || userId !== envAdminId) {
    return res.status(403).json({ error: "Odmowa dostępu. Nie jesteś administratorem." });
  }

  // 4. Jeśli pasuje, przepuść dalej
  next();
};