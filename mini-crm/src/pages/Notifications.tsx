import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

type Notification = {
  id: number;
  content: string;
  created_at: string;
  is_read: boolean;
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:3001/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erreur serveur");

        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error("Erreur chargement notifications :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    const token = localStorage.getItem("authToken");
    await fetch("http://localhost:3001/api/notifications/mark-all-read", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-4 text-text-primary">🛎️ Notifications</h1>

        <button
          onClick={markAllAsRead}
          className="mb-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Marquer tout comme lu
        </button>

        {loading ? (
          <p className="text-text-secondary">Chargement des notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-text-secondary">Aucune notification disponible.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border border-border bg-card">
            <table className="min-w-full divide-y divide-border text-sm text-text-primary">
              <thead className="bg-bg border-b border-border">
                <tr>
                  <th className="px-4 py-2 text-left">Contenu</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {notifications
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((notif) => (
                    <tr key={notif.id} className={notif.is_read ? "bg-transparent" : "bg-muted/20"}>
                      <td className="px-4 py-2">{notif.content}</td>
                      <td className="px-4 py-2">
                        {new Date(notif.created_at).toLocaleString("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-2">
                        {notif.is_read ? (
                          <span className="text-green-600 font-medium">Lue</span>
                        ) : (
                          <span className="text-orange-500 font-medium">Non lue</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
