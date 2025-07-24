const express = require("express");
const router = express.Router();
const { Conversation, Message } = require("../models");

// Créer une conversation entre deux utilisateurs
router.post("/conversations", async (req, res) => {
  const { user1Id, user2Id } = req.body;
  try {
    const convo = await Conversation.create([user1Id, user2Id]);
    res.json(convo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Envoyer un message à une conversation
router.post("/messages", async (req, res) => {
  const { conversationId, sender, text } = req.body;
  try {
    const msg = await Message.create({ conversationId, sender, text });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer les messages d'une conversation
router.get("/messages/:conversationId", async (req, res) => {
  try {
    const messages = await Conversation.getMessages(req.params.conversationId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
