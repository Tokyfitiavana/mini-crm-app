const jwt = require("jsonwebtoken");
const db = require("../config/db");

let connectedUsers = [];

module.exports = (io) => {
  io.on("connection", async (socket) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.error("❌ Token manquant");
      return socket.disconnect();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.user?.id;

      if (!userId) {
        console.error("❌ ID utilisateur non trouvé dans le token :", decoded);
        return socket.disconnect();
      }

      const [userRows] = await db.query("SELECT id, name, avatar FROM users WHERE id = ?", [userId]);
      if (userRows.length === 0) {
        console.error("❌ Utilisateur non trouvé dans la base :", userId);
        return socket.disconnect();
      }

      const user = userRows[0];
      console.log("✅ Utilisateur connecté :", user);

      connectedUsers = connectedUsers.filter((u) => u.id !== user.id);
      connectedUsers.push({ ...user, socketId: socket.id });
      io.emit("users_list", connectedUsers);

      const [existingConvos] = await db.query(
        `SELECT c.id AS conversationId, u.id AS userId, u.name, u.avatar
         FROM conversations c
         JOIN conversation_users cu1 ON cu1.conversation_id = c.id AND cu1.user_id = ?
         JOIN conversation_users cu2 ON cu2.conversation_id = c.id AND cu2.user_id != ?
         JOIN users u ON u.id = cu2.user_id`,
        [user.id, user.id]
      );

      const formattedConversations = [];
      for (const row of existingConvos) {
        const [messages] = await db.query(
          `SELECT id, sender_id, content AS text, created_at AS timestamp
           FROM messages
           WHERE conversation_id = ?
           ORDER BY created_at ASC`,
          [row.conversationId]
        );

        const formattedMessages = messages.map((m) => ({
          id: m.id,
          text: m.text,
          sender: m.sender_id === user.id ? "me" : "other",
          timestamp: new Date(m.timestamp).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        formattedConversations.push({
          id: row.conversationId,
          user: {
            id: row.userId,
            name: row.name,
            avatar: row.avatar,
          },
          messages: formattedMessages,
        });
      }

      socket.emit("existing_conversations", formattedConversations);

      socket.on("disconnect", () => {
        connectedUsers = connectedUsers.filter((u) => u.socketId !== socket.id);
        io.emit("users_list", connectedUsers);
        console.log("❎ Déconnexion :", user.name);
      });

      socket.on("start_conversation", async ({ user1Id, user2Id }) => {
        const [existing] = await db.query(
          `SELECT c.id FROM conversations c
           JOIN conversation_users cu1 ON c.id = cu1.conversation_id AND cu1.user_id = ?
           JOIN conversation_users cu2 ON c.id = cu2.conversation_id AND cu2.user_id = ?`,
          [user1Id, user2Id]
        );

        let conversationId;
        if (existing.length > 0) {
          conversationId = existing[0].id;
        } else {
          const [convRes] = await db.query("INSERT INTO conversations () VALUES ()");
          conversationId = convRes.insertId;
          await db.query(
            "INSERT INTO conversation_users (conversation_id, user_id) VALUES (?, ?), (?, ?)",
            [conversationId, user1Id, conversationId, user2Id]
          );
        }

        const [user2Rows] = await db.query("SELECT id, name, avatar FROM users WHERE id = ?", [user2Id]);
        const [messages] = await db.query(
          `SELECT id, sender_id, content AS text, created_at AS timestamp
           FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`,
          [conversationId]
        );

        const formattedMessages = messages.map((m) => ({
          id: m.id,
          text: m.text,
          sender: m.sender_id === user1Id ? "me" : "other",
          timestamp: new Date(m.timestamp).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        socket.emit("conversation_started", {
          id: conversationId,
          user: user2Rows[0],
          messages: formattedMessages,
        });
      });

      socket.on("send_message", async ({ conversationId, message }) => {
        const sender = connectedUsers.find((u) => u.socketId === socket.id);
        if (!sender) return;

        const [msgRes] = await db.query(
          "INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)",
          [conversationId, sender.id, message.text]
        );

        const newMessage = {
          id: msgRes.insertId,
          text: message.text,
          sender: "other",
          timestamp: new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        const [usersInConvo] = await db.query(
          "SELECT user_id FROM conversation_users WHERE conversation_id = ?",
          [conversationId]
        );

        const recipientId = usersInConvo.find((u) => u.user_id !== sender.id)?.user_id;
        const recipientSocket = connectedUsers.find((u) => u.id === recipientId);

        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit("receive_message", {
            conversationId,
            message: newMessage,
          });
        }
      });

      socket.on("typing", ({ conversationId }) => {
        const sender = connectedUsers.find((u) => u.socketId === socket.id);
        if (!sender) return;

        const [recipient] = connectedUsers.filter((u) => u.id !== sender.id);
        if (recipient) {
          io.to(recipient.socketId).emit("typing", {
            conversationId,
            userId: sender.id,
          });
        }
      });

      socket.on("delete_message", async ({ messageId, conversationId }) => {
        try {
          await db.query("DELETE FROM messages WHERE id = ?", [messageId]);
          io.to(socket.id).emit("message_deleted", { messageId, conversationId });
        } catch (err) {
          console.error("❌ Erreur lors de la suppression du message :", err.message);
        }
      });

      socket.on("delete_conversation", async ({ conversationId }) => {
        try {
          await db.query("DELETE FROM messages WHERE conversation_id = ?", [conversationId]);
          await db.query("DELETE FROM conversation_users WHERE conversation_id = ?", [conversationId]);
          await db.query("DELETE FROM conversations WHERE id = ?", [conversationId]);

          io.to(socket.id).emit("conversation_deleted", { conversationId });
        } catch (err) {
          console.error("❌ Erreur lors de la suppression de la conversation :", err.message);
        }
      });

    } catch (err) {
      console.error("❌ Erreur d’authentification socket :", err.message);
      socket.disconnect();
    }
  });
};
