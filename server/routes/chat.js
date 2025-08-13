const express = require("express");
const router = express.Router();
const { Conversation, Message } = require("../models");


router.post("/conversations", async (req, res) => {
  const { user1Id, user2Id } = req.body;
  try {
    const convo = await Conversation.create([user1Id, user2Id]);
    res.json(convo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/messages", async (req, res) => {
  const { conversationId, sender, text } = req.body;
  try {
    const msg = await Message.create({ conversationId, sender, text });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/messages/:conversationId", async (req, res) => {
  try {
    const messages = await Conversation.getMessages(req.params.conversationId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
