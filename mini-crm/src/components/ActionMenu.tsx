import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

interface ActionMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
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

  if (!onEdit && !onDelete) {
    return null;
  }

  const handleEditClick = () => {
    console.log("Le bouton Modifier a été cliqué !");
    if (onEdit) {
      console.log("La fonction onEdit existe, on l'appelle.");
      onEdit();
    }
    setIsOpen(false);
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-bg"
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg z-10 border border-border">
          <ul className="py-1">
            {onEdit && (
              <li>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg"
                >
                  <Edit size={16} />
                  Modifier
                </button>
              </li>
            )}
            {onDelete && (
              <li>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-bg"
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
