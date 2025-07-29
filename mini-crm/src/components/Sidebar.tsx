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
import Logo from './Logo';

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
  return (
    <aside className="w-64 bg-card text-text-primary flex flex-col h-screen border-r border-border">
      <div className="flex items-center justify-center h-20 border-b border-border">
        <Logo />
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
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
            <span>{name}</span>
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
          <span>Paramètres</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
