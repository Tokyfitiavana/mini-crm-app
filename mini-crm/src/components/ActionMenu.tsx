import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenu = ({ onEdit, onDelete }: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-gray-700"
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-dark-card rounded-md shadow-lg z-10 border border-border">
          <ul className="py-1">
            <li>
              <button
                onClick={() => {
                  onEdit();
                  setIsOpen(false);
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-gray-700"
              >
                <Edit size={16} />
                Modifier
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-700"
              >
                <Trash2 size={16} />
                Supprimer
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
