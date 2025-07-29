import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Paperclip, Trash2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Swal from "sweetalert2";

// Types
type User = { id: number; name: string; avatar?: string };
type Message = {
  id?: number;
  text: string;
  sender: "me" | "other";
  timestamp?: string;
};
type Conversation = {
  id: number;
  user: User;
  messages: Message[];
  unread?: number;
};

const currentUser: User = JSON.parse(localStorage.getItem("user") || "{}");
const authToken = localStorage.getItem("authToken");

const Chat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingStatus, setTypingStatus] = useState<{ [key: number]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const isUserOnline = (userId: number) => onlineUsers.some((u) => u.id === userId);

  useEffect(() => {
    if (!authToken || !currentUser?.id || socketRef.current) return;

    const socket = io("http://localhost:3001", {
      auth: { token: authToken },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => console.log("🔌 Socket connecté"));

    socket.on("users_list", (users: User[]) => {
      setOnlineUsers(users.filter((u) => u.id !== currentUser.id));
    });

    socket.on("receive_message", ({ conversationId, message }) => {
      if (message.sender !== "me" && notificationSoundRef.current) {
        notificationSoundRef.current.play().catch(() => {});
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c
        )
      );
    });

    socket.on("conversation_started", (newConvo: Conversation) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === newConvo.id);
        return exists ? prev : [...prev, newConvo];
      });
      setActiveConversationId(newConvo.id);
    });

    socket.on("existing_conversations", (existing: Conversation[]) => {
      setConversations(existing);
    });

    socket.on("typing", ({ conversationId }) => {
      setTypingStatus((prev) => ({ ...prev, [conversationId]: true }));
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus((prev) => ({ ...prev, [conversationId]: false }));
      }, 2000);
    });

    socket.on("conversation_deleted", ({ conversationId }) => {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
    });

    socket.on("message_deleted", ({ conversationId, messageId }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: c.messages.filter((m) => m.id !== messageId),
              }
            : c
        )
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !activeConversation) return;
    const socket = socketRef.current;
    if (!socket) return;

    const myMessage: Message = { sender: "me", text: newMessage };

    socket.emit("send_message", {
      conversationId: activeConversation.id,
      message: myMessage,
    });

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  ...myMessage,
                  timestamp: new Date().toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  id: Date.now(),
                },
              ],
            }
          : c
      )
    );
    setNewMessage("");
  };

  const startConversation = (otherUserId: number) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("start_conversation", {
      user1Id: currentUser.id,
      user2Id: otherUserId,
    });
  };

  const handleTyping = () => {
    const socket = socketRef.current;
    if (!socket || !activeConversation) return;
    socket.emit("typing", { conversationId: activeConversation.id });
  };

  const getAvatar = (user: User) => {
    return user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
  };

  const confirmDeleteConversation = () => {
    Swal.fire({
      title: "Supprimer cette conversation ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed && activeConversation) {
        socketRef.current?.emit("delete_conversation", {
          conversationId: activeConversation.id,
        });
      }
    });
  };

  return (
    <DashboardLayout>
      <audio ref={notificationSoundRef} src="/sounds/notification-tone-swift-gesture.mp3" preload="auto" />
      <div className="flex h-full bg-muted">
        <div className="w-full md:w-1/3 xl:w-1/4 border-r border-border bg-background flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-primary">Messagerie</h2>
          </div>

          <div className="border-b border-border px-2 py-1">
            <p className="text-xs text-muted-foreground mb-1">Utilisateurs en ligne</p>
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
              {onlineUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => startConversation(user.id)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/70"
                >
                  <div className="relative">
                    <img src={getAvatar(user)} alt={user.name} className="w-8 h-8 rounded-full" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                  </div>
                  <span className="text-sm text-foreground truncate">{user.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConversationId(c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                  activeConversationId === c.id ? "bg-muted/50" : "hover:bg-muted/30"
                }`}
              >
                <img src={getAvatar(c.user)} alt={c.user.name} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-foreground truncate">{c.user.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {c.messages.at(-1)?.timestamp || ""}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.messages.at(-1)?.text || ""}
                  </p>
                </div>
                <span
                  className={`text-xs ${
                    isUserOnline(c.user.id) ? "text-green-500" : "text-muted-foreground"
                  }`}
                >
                  {isUserOnline(c.user.id) ? "En ligne" : "Hors ligne"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {activeConversation && (
          <div className="hidden md:flex w-2/3 xl:w-3/4 flex-col">
            <div className="p-4 border-b border-border flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <img src={getAvatar(activeConversation.user)} className="w-10 h-10 rounded-full" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {activeConversation.user.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {typingStatus[activeConversation.id]
                      ? "En train d'écrire..."
                      : isUserOnline(activeConversation.user.id)
                      ? "En ligne"
                      : "Hors ligne"}
                  </p>
                </div>
              </div>
              <button
                onClick={confirmDeleteConversation}
                className="text-red-500 hover:text-red-700"
                title="Supprimer la conversation"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto flex flex-col-reverse gap-4 bg-background">
              <div ref={messagesEndRef} />
              {activeConversation.messages
                .slice()
                .reverse()
                .map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                        msg.sender === "me"
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs mt-1 text-right text-muted-foreground">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-4 bg-background border-t border-border">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Écrivez votre message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="w-full bg-muted text-sm py-2 pl-10 pr-24 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Paperclip className="text-muted-foreground" size={18} />
                </div>
                <button
                  onClick={handleSendMessage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-md hover:bg-primary/90"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Chat;
