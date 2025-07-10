import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Search, Send, Paperclip } from "lucide-react";

type User = { id: number; name: string; avatar: string };
type Message = {
  id: number;
  text: string;
  sender: "me" | "other";
  timestamp: string;
};
type Conversation = {
  id: number;
  user: User;
  messages: Message[];
  unread?: number;
};

const mockConversations: Conversation[] = [
  {
    id: 1,
    user: {
      id: 1,
      name: "Jean Dupont",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Jean%20Dupont",
    },
    messages: [
      {
        id: 1,
        text: "Bonjour, j'aurais une question sur le produit X.",
        sender: "other",
        timestamp: "10:30",
      },
      {
        id: 2,
        text: "Bien sûr, comment puis-je vous aider ?",
        sender: "me",
        timestamp: "10:31",
      },
    ],
    unread: 2,
  },
  {
    id: 2,
    user: {
      id: 2,
      name: "Marie Curie",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Marie%20Curie",
    },
    messages: [
      {
        id: 1,
        text: "Merci pour le devis !",
        sender: "other",
        timestamp: "Hier",
      },
    ],
  },
  {
    id: 3,
    user: {
      id: 3,
      name: "Louis Pasteur",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Louis%20Pasteur",
    },
    messages: [
      {
        id: 1,
        text: "Je vous confirme la commande.",
        sender: "other",
        timestamp: "Hier",
      },
      {
        id: 2,
        text: "Excellent ! Je prépare ça tout de suite.",
        sender: "me",
        timestamp: "Hier",
      },
    ],
    unread: 1,
  },
];

const Chat = () => {
  const [conversations, setConversations] = useState(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    conversations[0]?.id || null
  );
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  useEffect(() => {}, []);

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !activeConversation) return;

    const myMessage: Message = {
      id: Date.now(),
      text: newMessage,
      sender: "me",
      timestamp: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    updateConversationWithNewMessage(activeConversation.id, myMessage);
    setNewMessage("");

    setTimeout(() => {
      const theirReply: Message = {
        id: Date.now() + 1,
        text: "Merci, je regarde ça !",
        sender: "other",
        timestamp: new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      updateConversationWithNewMessage(activeConversation.id, theirReply);
    }, 1000);
  };

  const updateConversationWithNewMessage = (
    convoId: number,
    message: Message
  ) => {
    setConversations((prevConvos) =>
      prevConvos.map((convo) =>
        convo.id === convoId
          ? {
              ...convo,
              messages: [...convo.messages, message],
              unread: convo.unread ? 0 : undefined,
            }
          : convo
      )
    );
  };

  if (!activeConversation) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center text-text-secondary">
          <p>Sélectionnez une conversation pour commencer à discuter.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-full">
        <div className="w-full md:w-1/3 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold text-text-primary">Messages</h2>
            <div className="relative mt-4">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                size={18}
              />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-card/50 pl-10 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setActiveConversationId(convo.id)}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-card/80 transition-colors duration-200 ${
                  activeConversationId === convo.id ? "bg-card" : ""
                }`}
              >
                <img
                  src={convo.user.avatar}
                  alt={convo.user.name}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-text-primary truncate">
                      {convo.user.name}
                    </h3>
                    <span className="text-xs text-text-secondary flex-shrink-0">
                      {convo.messages[convo.messages.length - 1].timestamp}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-text-secondary truncate">
                      {convo.messages[convo.messages.length - 1].text}
                    </p>
                    {convo.unread && convo.unread > 0 && (
                      <span className="bg-primary text-white text-xs font-bold rounded-full px-2 py-0.5">
                        {convo.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:flex w-2/3 flex-col bg-bg">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <img
              src={activeConversation.user.avatar}
              alt={activeConversation.user.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-text-primary">
                {activeConversation.user.name}
              </h3>
              <p className="text-xs text-green-500">En ligne</p>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {activeConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.sender === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xl p-3 rounded-lg ${
                    msg.sender === "me"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-card text-text-primary rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "me"
                        ? "text-purple-200"
                        : "text-text-secondary"
                    } text-right`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-card border-t border-border">
            <div className="relative">
              <input
                type="text"
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="w-full bg-bg pr-24 pl-12 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <button className="text-text-secondary hover:text-text-primary">
                  <Paperclip size={20} />
                </button>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <button
                  onClick={handleSendMessage}
                  className="bg-primary text-white p-2 rounded-lg hover:opacity-90"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
