const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Pobierz token z nagłówka
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ error: "Odmowa dostępu. Brak tokena." });
    }

    // 2. Usuń prefiks "Bearer ", jeśli istnieje (standard JWT)
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7, authHeader.length).trim() 
        : authHeader;

    try {
        // 3. Zweryfikuj token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Przypisz zdekodowane dane (payload) do req.user
        // Upewnij się, że przy logowaniu (auth.js) używasz { _id: user._id }
        req.user = verified;
        
        console.log("🔑 Middleware Auth - Zdekodowany user:", req.user); // DEBUG
        
        next();
    } catch (err) {
        console.error("Błąd weryfikacji tokena:", err.message);
        res.status(400).json({ error: "Nieprawidłowy token." });
    }
};