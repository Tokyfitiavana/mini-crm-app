const pool = require("../config/db");

const Conversation = {
    async create(participantIds = []) {
      const [result] = await pool.query(
        "INSERT INTO conversations (unread) VALUES (0)"
      );
      const conversationId = result.insertId;
  
      for (const userId of participantIds) {
        if (!userId) {
          console.error("❌ userId est vide ou nul :", userId);
          continue;
        }
        await pool.query(
          "INSERT INTO conversation_users (conversation_id, user_id) VALUES (?, ?)",
          [conversationId, userId]
        );
      }
  
      return { id: conversationId, unread: 0 };
    },
  
  async incrementUnread(conversationId) {
    await pool.query(
      "UPDATE conversations SET unread = unread + 1 WHERE id = ?",
      [conversationId]
    );
  },

  async getMessages(conversationId) {
    const [rows] = await pool.query(
      "SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC",
      [conversationId]
    );
    return rows;
  },

  async getAllForUser(userId) {
    const [rows] = await pool.query(
      `SELECT c.* FROM conversations c
       JOIN conversation_users cu ON c.id = cu.conversation_id
       WHERE cu.user_id = ?`,
      [userId]
    );
    return rows;
  },
};

module.exports = Conversation;
