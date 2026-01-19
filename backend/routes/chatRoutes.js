const express = require('express');
const router = express.Router();
const { generateChatResponse } = require('../services/chatService');

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { messages, inventory } = req.body;

    // Walidacja podstawowa
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Wymagana jest tablica 'messages'." });
    }

    // Wywołanie logiki biznesowej
    const reply = await generateChatResponse(messages, inventory || []);

    // Odpowiedź do frontendu
    res.json({ reply });

  } catch (error) {
    console.error("Chat Route Error:", error.message);
    res.status(500).json({ error: "Błąd serwera podczas przetwarzania czatu." });
  }
});

module.exports = router;