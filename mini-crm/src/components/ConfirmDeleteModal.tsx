interface ConfirmDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  itemName: string;
}

const ConfirmDeleteModal = ({
  onConfirm,
  onCancel,
  itemName,
}: ConfirmDeleteModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
        <h3 className="text-xl font-bold text-text-primary mb-2">
          Confirmer la suppression
        </h3>
        <p className="text-text-secondary mb-6">
          Êtes-vous sûr de vouloir supprimer "{itemName}" ? Cette action est
          irréversible.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="py-2 px-6 rounded-md bg-gray-600 text-white hover:bg-gray-500"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="py-2 px-6 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
