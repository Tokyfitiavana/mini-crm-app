import React, { useEffect, useState } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";

interface UserType {
  id: number;
  name: string;
  email: string;
  role?: string;
}

const Header = () => {
  const [user, setUser] = useState<UserType | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        } else {
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("Erreur récupération utilisateur :", error);
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="sticky top-0 z-10 h-16 flex items-center justify-end px-6 bg-card border-b border-border">
      <DropdownMenu
        trigger={
          <div className="flex items-center space-x-3 cursor-pointer">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                user ? encodeURIComponent(user.name) : "User"
              }`}
              alt="Avatar"
              className="w-9 h-9 rounded-full"
            />
            <div className="hidden md:block">
              <p className="font-semibold text-sm text-text-primary">
                {user ? user.name : "Chargement..."}
              </p>
            </div>
          </div>
        }
      >
        <div className="p-4 border-b border-border">
          <p className="font-semibold text-text-primary">
            {user ? user.name : "Chargement..."}
          </p>
          <p className="text-sm text-text-secondary">
            {user ? user.email : ""}
          </p>
        </div>
        <ul className="py-2">
          <li>
            <Link
              to="/parametres"
              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg"
            >
              <User size={16} /> Mon Profil
            </Link>
          </li>
          <li>
            <Link
              to="/parametres"
              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg"
            >
              <Settings size={16} /> Paramètres
            </Link>
          </li>
          <li className="border-t border-border mt-2 pt-2">
            <button
              onClick={() => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");
                setUser(null);
                window.location.href = "/login";
              }}
              className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-bg"
            >
              <LogOut size={16} /> Déconnexion
            </button>
          </li>
        </ul>
      </DropdownMenu>
    </header>
  );
};

export default Header;
