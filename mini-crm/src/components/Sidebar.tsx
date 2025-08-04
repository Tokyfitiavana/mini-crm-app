import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Bell,
  MessageSquare,
  Settings,
  BarChartHorizontal,
  Package,
  ShoppingCart,
} from "lucide-react";
import Logo from "./Logo";
import IconLogo from "../assets/logos.png";

const menuItems = [
  { name: "Tableau de bord", icon: Home, path: "/dashboard" },
  { name: "Clients", icon: Users, path: "/clients" },
  { name: "Rappels", icon: Bell, path: "/rappels" },
  { name: "Stock", icon: Package, path: "/stock" },
  { name: "Ventes", icon: ShoppingCart, path: "/sales" },
  { name: "Pipeline", icon: BarChartHorizontal, path: "/pipeline" },
  { name: "Chat", icon: MessageSquare, path: "/chat" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    // Lire la valeur depuis le localStorage au chargement initial
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  // Sauvegarder la valeur à chaque changement
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-card text-text-primary flex flex-col h-screen border-r border-border transition-all duration-300`}
    >
      <div className="h-20 flex items-center justify-center border-b border-border overflow-hidden">
        {collapsed ? (
          <img src={IconLogo} alt="Logo réduit" className="h-8 w-auto" />
        ) : (
          <div className="px-4 w-full flex items-center justify-center">
            <Logo className="h-10 w-auto max-h-16" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-6 space-y-2">
        {menuItems.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-primary text-white font-semibold"
                  : "text-text-secondary hover:bg-bg hover:text-text-primary"
              }`
            }
          >
            <Icon size={20} />
            {!collapsed && <span>{name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-6 border-t border-border">
        <NavLink
          to="/parametres"
          className={({ isActive }: { isActive: boolean }) =>
            `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive
                ? "bg-primary text-white font-semibold"
                : "text-text-secondary hover:bg-bg hover:text-text-primary"
            }`
          }
        >
          <Settings size={20} />
          {!collapsed && <span>Paramètres</span>}
        </NavLink>
      </div>

      <div className="px-4 py-4 border-t border-border">
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="w-full px-3 py-2 bg-surface hover:bg-bg border border-border rounded text-sm text-text-secondary"
        >
          {collapsed ? "▶ Déplier" : "◀ Réduire"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
