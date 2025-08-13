const jwt = require("jsonwebtoken");
const db = require("../config/db");

let connectedUsers = [];

module.exports = (io) => {
  io.on("connection", async (socket) => {
    const token = socket.handshake.auth?.token;
    if (!token) return socket.disconnect();

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded?.user?.id;
      if (!userId) return socket.disconnect();

      const [userRows] = await db.query(
        "SELECT id, name, avatar FROM users WHERE id = ?",
        [userId]
      );
      if (userRows.length === 0) return socket.disconnect();

      const user = userRows[0];

      connectedUsers = connectedUsers.filter((u) => u.id !== user.id);
      connectedUsers.push({ ...user, socketId: socket.id });
      io.emit("users_list", connectedUsers);

      // ——— Charger les conversations existantes + pièces jointes ———
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
          `SELECT 
             id,
             sender_id,
             content                  AS text,
             attachment_url           AS a_url,
             attachment_name          AS a_name,
             attachment_mime          AS a_mime,
             attachment_size          AS a_size,
             created_at               AS timestamp
           FROM messages
           WHERE conversation_id = ?
           ORDER BY created_at ASC`,
          [row.conversationId]
        );

        const formattedMessages = messages.map((m) => ({
          id: m.id,
          text: m.text ?? "",
          sender: m.sender_id === user.id ? "me" : "other",
          timestamp: new Date(m.timestamp).toISOString(), // ISO, le front normalise/affiche
          attachment:
            m.a_url
              ? {
                  url: m.a_url,          // laisser relatif (ex: /uploads/xxx) — le front le met en absolu
                  name: m.a_name || "",
                  mime: m.a_mime || "",
                  size: m.a_size || 0,
                }
              : null,
        }));

        formattedConversations.push({
          id: row.conversationId,
          user: { id: row.userId, name: row.name, avatar: row.avatar },
          messages: formattedMessages,
        });
      }
      socket.emit("existing_conversations", formattedConversations);

      socket.on("disconnect", () => {
        connectedUsers = connectedUsers.filter((u) => u.socketId !== socket.id);
        io.emit("users_list", connectedUsers);
      });

      // ——— Démarrer/ouvrir une conversation ———
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

        const [user2Rows] = await db.query(
          "SELECT id, name, avatar FROM users WHERE id = ?",
          [user2Id]
        );
        const [messages] = await db.query(
          `SELECT 
             id,
             sender_id,
             content AS text,
             attachment_url AS a_url,
             attachment_name AS a_name,
             attachment_mime AS a_mime,
             attachment_size AS a_size,
             created_at AS timestamp
           FROM messages
           WHERE conversation_id = ?
           ORDER BY created_at ASC`,
          [conversationId]
        );

        const formattedMessages = messages.map((m) => ({
          id: m.id,
          text: m.text ?? "",
          sender: m.sender_id === user1Id ? "me" : "other",
          timestamp: new Date(m.timestamp).toISOString(),
          attachment: m.a_url
            ? {
                url: m.a_url,
                name: m.a_name || "",
                mime: m.a_mime || "",
                size: m.a_size || 0,
              }
            : null,
        }));

        socket.emit("conversation_started", {
          id: conversationId,
          user: user2Rows[0],
          messages: formattedMessages,
        });
      });

      // ——— Envoyer un message (texte et/ou pièce jointe) ———
      socket.on("send_message", async ({ conversationId, message }) => {
        const sender = connectedUsers.find((u) => u.socketId === socket.id);
        if (!sender) return;

        const text = (message?.text ?? "").toString(); // toujours une string ('' si vide)
        const att = message?.attachment || null;

        const [msgRes] = await db.query(
          `INSERT INTO messages
           (conversation_id, sender_id, content, attachment_url, attachment_name, attachment_mime, attachment_size)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            conversationId,
            sender.id,
            text,                               // <= JAMAIS NULL
            att?.url || null,
            att?.name || null,
            att?.mime || null,
            att?.size ?? null,
          ]
        );

        const outMessage = {
          id: msgRes.insertId,
          text,
          sender: "other",                      // pour le destinataire, c'est "other"
          timestamp: new Date().toISOString(),
          attachment: att
            ? {
                url: att.url,
                name: att.name || "",
                mime: att.mime || "",
                size: att.size || 0,
              }
            : null,
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
            message: outMessage,
          });
        }

        // On peut aussi accuser réception à l’émetteur si besoin :
        // io.to(socket.id).emit("message_sent", { conversationId, messageId: msgRes.insertId });
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
          console.error("❌ delete_message:", err.message);
        }
      });

      socket.on("delete_conversation", async ({ conversationId }) => {
        try {
          await db.query("DELETE FROM messages WHERE conversation_id = ?", [conversationId]);
          await db.query("DELETE FROM conversation_users WHERE conversation_id = ?", [conversationId]);
          await db.query("DELETE FROM conversations WHERE id = ?", [conversationId]);
          io.to(socket.id).emit("conversation_deleted", { conversationId });
        } catch (err) {
          console.error("❌ delete_conversation:", err.message);
        }
      });

      socket.on("edit_message", async ({ conversationId, messageId, newText }) => {
        try {
          await db.query("UPDATE messages SET content = ? WHERE id = ?", [
            (newText ?? "").toString(),
            messageId,
          ]);

          const [users] = await db.query(
            "SELECT user_id FROM conversation_users WHERE conversation_id = ?",
            [conversationId]
          );
          const recipient = connectedUsers.find(
            (u) => u.id !== user.id && users.some((us) => us.user_id === u.id)
          );
          if (recipient) {
            io.to(recipient.socketId).emit("message_edited", {
              conversationId,
              messageId,
              newText: (newText ?? "").toString(),
            });
          }

          io.to(socket.id).emit("message_edited", {
            conversationId,
            messageId,
            newText: (newText ?? "").toString(),
          });
        } catch (err) {
          console.error("❌ edit_message:", err.message);
        }
      });
    } catch (err) {
      console.error("❌ Auth socket :", err.message);
      socket.disconnect();
    }
  });
};
