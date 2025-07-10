import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Bell,
  MessageSquare,
  Settings,
  BarChartHorizontal,
} from "lucide-react";

const menuItems = [
  { name: "Tableau de bord", icon: Home, path: "/dashboard" },
  { name: "Clients", icon: Users, path: "/clients" },
  { name: "Rappels", icon: Bell, path: "/rappels" },
  { name: "Chat", icon: MessageSquare, path: "/chat" },
  { name: "Pipeline", icon: BarChartHorizontal, path: "/pipeline" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-card text-text-primary flex flex-col h-screen border-r border-border">
      <div className="text-2xl font-bold text-center py-6 border-b border-border text-primary">
        Mini CRM
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
