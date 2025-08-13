import { useState, useEffect, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import {
  Send,
  Paperclip,
  Trash2,
  Search,
  MessageSquare,
  FileDown,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Swal from "sweetalert2";
import axios from "axios";

type User = { id: number; name: string; avatar?: string };

type Attachment = {
  url: string;
  name: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
};

type Message = {
  id?: number;
  text: string;
  sender: "me" | "other";
  timestamp?: string;
  attachment?: Attachment | null;
};

type Conversation = {
  id: number;
  user: User;
  messages: Message[];
  unread?: number;
};

const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:3001";

const currentUser: User = JSON.parse(localStorage.getItem("user") || "{}");
const authToken = localStorage.getItem("authToken");

// ---------- Helpers ----------
const abs = (u?: string | null) =>
  !u ? "" : u.startsWith("http") ? u : `${API_BASE_URL}${u}`;

const toISO = (ts?: unknown): string => {
  if (typeof ts === "number") {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  if (typeof ts === "string") {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  return new Date().toISOString();
};

const safeTime = (ts?: unknown): string => {
  if (ts === undefined || ts === null) return "";
  const d = new Date(ts as any);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

const safeDayLabel = (ts?: unknown): string => {
  if (ts === undefined || ts === null) return "";
  const d = new Date(ts as any);
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Aujourd'hui";
  if (sameDay(d, yesterday)) return "Hier";
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const Chat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingStatus, setTypingStatus] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [search, setSearch] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null;
  const isUserOnline = (userId: number) =>
    onlineUsers.some((u) => u.id === userId);

  // ---------- SOCKET ----------
  useEffect(() => {
    if (!authToken || !currentUser?.id || socketRef.current) return;

    const socket = io(API_BASE_URL, {
      auth: { token: authToken },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("users_list", (users: User[]) => {
      setOnlineUsers(users.filter((u) => u.id !== currentUser.id));
    });

    socket.on("receive_message", ({ conversationId, message }) => {
      if (message.sender !== "me" && notificationSoundRef.current) {
        notificationSoundRef.current.play().catch(() => {});
      }
      const normalized: Message = {
        ...message,
        timestamp: toISO(message?.timestamp),
        attachment: message?.attachment
          ? { ...message.attachment, url: abs(message.attachment.url) }
          : null,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, normalized] }
            : c
        )
      );
    });

    socket.on("conversation_started", (newConvo: Conversation) => {
      const normalized: Conversation = {
        ...newConvo,
        messages: (newConvo.messages || []).map((m: any) => ({
          ...m,
          timestamp: toISO(m?.timestamp),
          attachment: m?.attachment
            ? { ...m.attachment, url: abs(m.attachment.url) }
            : null,
        })),
      };
      setConversations((prev) =>
        prev.some((c) => c.id === normalized.id) ? prev : [...prev, normalized]
      );
      setActiveConversationId(normalized.id);
    });

    socket.on("existing_conversations", (existing: Conversation[]) => {
      const normalized = existing.map((c) => ({
        ...c,
        messages: c.messages.map((m: any) => ({
          ...m,
          timestamp: toISO(m?.timestamp),
          attachment: m?.attachment
            ? { ...m.attachment, url: abs(m.attachment.url) }
            : null,
        })),
      }));
      setConversations(normalized);
    });

    socket.on("typing", ({ conversationId }) => {
      setTypingStatus((prev) => ({ ...prev, [conversationId]: true }));
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(
        () =>
          setTypingStatus((prev) => ({ ...prev, [conversationId]: false })),
        2000
      );
    });

    socket.on("conversation_deleted", ({ conversationId }) => {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId)
        setActiveConversationId(null);
    });

    socket.on("message_deleted", ({ conversationId, messageId }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) }
            : c
        )
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeConversationId]);

  // ---------- Auto scroll ----------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages?.length]);

  // ---------- Filtrage conversations ----------
  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      const last = c.messages.at(-1);
      const lastPreview =
        (last?.attachment && !last?.text
          ? "📎 Pièce jointe"
          : last?.text || ""
        ).toLowerCase();
      return c.user.name.toLowerCase().includes(q) || lastPreview.includes(q);
    });
  }, [conversations, search]);

  // ---------- Envoi texte ----------
  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !activeConversation) return;
    const socket = socketRef.current;
    if (!socket) return;

    const now = new Date();
    const myMessage: Message = {
      sender: "me",
      text: newMessage,
      timestamp: now.toISOString(),
      id: now.getTime(),
      attachment: null,
    };

    socket.emit("send_message", {
      conversationId: activeConversation.id,
      message: { sender: "me", text: newMessage, attachment: null },
    });

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, messages: [...c.messages, myMessage] }
          : c
      )
    );
    setNewMessage("");
  };

  // ---------- Typing ----------
  const handleTyping = () => {
    const socket = socketRef.current;
    if (!socket || !activeConversation) return;
    socket.emit("typing", { conversationId: activeConversation.id });
  };

  // ---------- Démarrer une conversation ----------
  const startConversation = (otherUserId: number) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("start_conversation", {
      user1Id: currentUser.id,
      user2Id: otherUserId,
    });
  };

  const getAvatar = (user: User) =>
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name
    )}&background=random`;

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

  // ---------- Upload ----------
  const uploadFile = async (file: File): Promise<Attachment> => {
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/upload`, form, {
        headers: { Authorization: `Bearer ${authToken}` },
        onUploadProgress: (e) => {
          if (e.total)
            setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      const att = res.data as Attachment;
      return { ...att, url: abs(att.url) };
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const sendAttachmentMessage = async (file: File) => {
    if (!activeConversation) return;
    const socket = socketRef.current;
    if (!socket) return;

    const previewUrl = URL.createObjectURL(file);
    const now = new Date();

    const optimistic: Message = {
      id: now.getTime(),
      sender: "me",
      text: newMessage.trim() ? newMessage : "",
      timestamp: now.toISOString(),
      attachment: {
        url: previewUrl,
        name: file.name,
        mime: file.type,
        size: file.size,
      },
    };

    // local
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, messages: [...c.messages, optimistic] }
          : c
      )
    );
    setNewMessage("");

    try {
      const att = await uploadFile(file);

      // remplacer l’optimiste par l’attachement réel
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === optimistic.id ? { ...m, attachment: att } : m
                ),
              }
            : c
        )
      );

      // envoyer au serveur
      socket.emit("send_message", {
        conversationId: activeConversation.id,
        message: {
          sender: "me",
          text: optimistic.text, // jamais null côté serveur
          attachment: att,
        },
      });
    } catch {
      // rollback si échec
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? { ...c, messages: c.messages.filter((m) => m.id !== optimistic.id) }
            : c
        )
      );
      Swal.fire("Erreur", "Upload échoué.", "error");
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const input = e.currentTarget;
    const file = input.files?.[0] || null;
    input.value = ""; // reset immédiat
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire("Fichier trop volumineux", "10 Mo maximum.", "warning");
      return;
    }

    void sendAttachmentMessage(file);
  };

  // ---------- Grouping ----------
  const groupedMessages = useMemo(() => {
    if (!activeConversation) return [];
    const groups: { day: string; items: Message[] }[] = [];
    for (const m of activeConversation.messages) {
      const day = safeDayLabel(m.timestamp);
      const last = groups[groups.length - 1];
      if (!last || last.day !== day) groups.push({ day, items: [m] });
      else last.items.push(m);
    }
    return groups;
  }, [activeConversation]);

  const renderAttachment = (att: Attachment | null | undefined) => {
    if (!att) return null;
    const isImg = att.mime?.startsWith("image/");
    const url = abs(att.url);
    if (isImg) {
      return (
        <div className="mt-2">
          <img
            src={url}
            alt={att.name || "pièce jointe"}
            className="rounded-md max-h-72 max-w-full object-contain border border-white/20"
            loading="lazy"
          />
          {att.name && (
            <p className="text-[10px] mt-1 opacity-80 truncate">{att.name}</p>
          )}
        </div>
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 flex items-center gap-2 text-xs underline underline-offset-2"
        title={`Télécharger ${att.name || "fichier"}`}
      >
        <FileDown size={16} />
        <span className="truncate max-w-[220px]">
          {att.name || "Fichier"}
        </span>
      </a>
    );
  };

  // ---------- UI ----------
  return (
    <DashboardLayout>
      <audio
        ref={notificationSoundRef}
        src="/sounds/notification-tone-swift-gesture.mp3"
        preload="auto"
      />
      <div className="h-[calc(100vh-80px)] bg-gradient-to-b from-background to-muted rounded-xl overflow-hidden border border-border">
        <div className="grid grid-cols-12 h-full">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-4 xl:col-span-3 border-r border-border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex flex-col">
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                Messagerie
              </h2>
            </div>

            <div className="p-3 border-b border-border">
              <div className="relative">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher…"
                  className="w-full pl-9 pr-3 py-2 rounded-md text-sm bg-bg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <Search
                  size={16}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary"
                />
              </div>
            </div>

            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs text-text-secondary mb-2">
                Utilisateurs en ligne
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {onlineUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => startConversation(user.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-bg hover:bg-card transition"
                    title={`Discuter avec ${user.name}`}
                  >
                    <div className="relative">
                      <img
                        src={getAvatar(user)}
                        alt={user.name}
                        className="w-7 h-7 rounded-full"
                      />
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
                    </div>
                    <span className="text-xs font-medium">{user.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((c) => {
                const last = c.messages.at(-1);
                const preview =
                  last?.attachment && !last?.text
                    ? "📎 Pièce jointe"
                    : last?.text || "Démarrer la conversation";
                const active = activeConversationId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                      active
                        ? "bg-primary/5 border-l-2 border-primary"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={getAvatar(c.user)}
                        alt={c.user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                          isUserOnline(c.user.id) ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold truncate">
                          {c.user.name}
                        </h4>
                        <span className="text-[10px] text-text-secondary">
                          {safeTime(last?.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary truncate">
                        {preview}
                      </p>
                    </div>
                    {!!c.unread && (
                      <span className="ml-2 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-primary text-white text-[10px] px-1">
                        {c.unread}
                      </span>
                    )}
                  </button>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="p-6 text-center text-text-secondary text-sm">
                  Aucune conversation.
                </div>
              )}
            </div>
          </aside>

          {/* Main */}
          <section className="col-span-12 md:col-span-8 xl:col-span-9 flex flex-col">
            {activeConversation ? (
              <>
                <div className="px-4 py-3 border-b border-border bg-card/60 backdrop-blur flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatar(activeConversation.user)}
                      className="w-10 h-10 rounded-full"
                      alt={activeConversation.user.name}
                    />
                    <div>
                      <h3 className="text-sm font-semibold">
                        {activeConversation.user.name}
                      </h3>
                      <p className="text-xs text-text-secondary">
                        {typingStatus[activeConversation.id]
                          ? "En train d'écrire…"
                          : isUserOnline(activeConversation.user.id)
                          ? "En ligne"
                          : "Hors ligne"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={confirmDeleteConversation}
                    className="text-red-500 hover:text-red-600 rounded-md p-2"
                    title="Supprimer la conversation"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* ZONE DE MESSAGES — prend toute la largeur, scrollbar à droite */}
                <div className="flex-1 overflow-y-auto bg-background">
                  <div className="px-4 py-5">
                    <div className="w-full space-y-6">
                      {groupedMessages.map((group, gi) => (
                        <div key={gi} className="space-y-3">
                          <div className="flex items-center justify-center">
                            <span className="text-[11px] text-text-secondary bg-card px-3 py-1 rounded-full border border-border">
                              {group.day}
                            </span>
                          </div>

                          {group.items.map((msg, idx) => {
                            const mine = msg.sender === "me";
                            return (
                              <div
                                key={msg.id ?? `${gi}-${idx}`}
                                className={`flex ${
                                  mine ? "justify-end" : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                                    mine
                                      ? "bg-primary text-white rounded-br-sm"
                                      : "bg-card text-foreground border border-border rounded-bl-sm"
                                  }`}
                                >
                                  {msg.text && (
                                    <p className="whitespace-pre-wrap break-words">
                                      {msg.text}
                                    </p>
                                  )}
                                  {renderAttachment(msg.attachment)}
                                  {msg.timestamp && (
                                    <p
                                      className={`text-[10px] mt-1 ${
                                        mine ? "text-white/80" : "text-text-secondary"
                                      } text-right`}
                                    >
                                      {safeTime(msg.timestamp)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {typingStatus[activeConversation.id] && (
                            <div className="flex justify-start">
                              <div className="max-w-[60%] px-3 py-2 rounded-2xl bg-card border border-border text-sm">
                                <span className="inline-flex gap-1 items-center">
                                  <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce [animation-delay:-0.2s]" />
                                  <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" />
                                  <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce [animation-delay:0.2s]" />
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>

                {/* COMPOSER — pleine largeur */}
                <div className="px-4 py-3 border-t border-border bg-card/60 backdrop-blur">
                  <div className="relative">
                    {uploading && (
                      <div className="absolute -top-2 left-0 right-0 h-1 bg-muted rounded overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder="Écrivez votre message…"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="w-full text-sm py-3 pl-11 pr-24 rounded-lg border border-border bg-bg text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground"
                      title="Joindre un fichier"
                    >
                      <Paperclip size={18} />
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={onFileChange}
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    />

                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || uploading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-3 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Envoyer"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-text-secondary">
                  <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <MessageSquare size={22} />
                  </div>
                  <p className="font-medium">Aucune conversation sélectionnée</p>
                  <p className="text-sm">
                    Choisissez un contact à gauche pour commencer.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
