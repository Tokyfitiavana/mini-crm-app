const NotificationsTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Notifications
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-text-secondary">Notifications par email</p>
          <input type="checkbox" className="toggle-checkbox" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-text-secondary">Notifications Push</p>
          <input type="checkbox" className="toggle-checkbox" />
        </div>
      </div>
    </div>
  );
};
export default NotificationsTab;
