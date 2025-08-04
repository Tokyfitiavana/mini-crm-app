module.exports = function checkPermission(requiredRole) {
    return (req, res, next) => {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Utilisateur non authentifié." });
      }
  
      if (req.user.role !== requiredRole) {
        return res.status(403).json({ message: "Permission refusée." });
      }
  
      next();
    };
  };
  