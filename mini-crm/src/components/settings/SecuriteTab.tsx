const SecuriteTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Changer le mot de passe
      </h2>
      <form className="space-y-6">
        <div>
          <label
            htmlFor="current-password"
            className="block text-sm font-medium text-text-secondary"
          >
            Mot de passe actuel
          </label>
          <input
            type="password"
            id="current-password"
            className="mt-1 w-full bg-bg border-border rounded-md p-2"
          />
        </div>
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-text-secondary"
          >
            Nouveau mot de passe
          </label>
          <input
            type="password"
            id="new-password"
            className="mt-1 w-full bg-bg border-border rounded-md p-2"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-white py-2 px-4 rounded-lg"
          >
            Mettre à jour
          </button>
        </div>
      </form>
    </div>
  );
};
export default SecuriteTab;
