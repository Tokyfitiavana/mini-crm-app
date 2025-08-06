import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const PromoteUserModal = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:3001/api/team/promote",
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Succès", "Invitation envoyée", "success");
      onClose();
    } catch (err: any) {
      Swal.fire("Erreur", err.response?.data?.message || "Échec", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[400px]">
        <h3 className="text-lg font-semibold mb-4">Promouvoir un utilisateur</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email de l'utilisateur"
            className="w-full border px-3 py-2 rounded"
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="text-gray-500">Annuler</button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Envoi..." : "Envoyer l’invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoteUserModal;