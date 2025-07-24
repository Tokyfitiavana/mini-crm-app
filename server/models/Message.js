const pool = require("../config/db");

const Message = {
  async create({ conversationId, sender, text }) {
    const [result] = await pool.query(
      "INSERT INTO messages (conversation_id, sender, text, timestamp) VALUES (?, ?, ?, NOW())",
      [conversationId, sender, text]
    );

    return {
      id: result.insertId,
      conversationId,
      sender,
      text,
      timestamp: new Date(),
    };
  },
};

module.exports = Message;
