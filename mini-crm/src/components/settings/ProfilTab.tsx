import React, { useState } from "react";

const ProfilTab = () => {
  const [fullName, setFullName] = useState("Toky Fitiavana");
  const [email, setEmail] = useState("tokynantenaina3@gmail.com");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // 🔐 Enregistrer dans l'API ici
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-900 rounded-2xl shadow-lg p-6 space-y-6">
      <h2 className="text-white text-xl font-semibold border-b pb-2">
        👤 Profil Public
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nom complet</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Adresse Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="text-end">
        <button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-lg transition"
        >
          Enregistrer
        </button>
        {saved && (
          <p className="text-green-400 text-sm mt-2">✅ Modifications enregistrées</p>
        )}
      </div>
    </div>
  );
};

export default ProfilTab;
