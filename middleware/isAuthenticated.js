// Import des modèles
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    // Si Token est renseigné on continue les vérifications
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    // console.log("UserCheck", user);

    if (!user) {
      // Mon token est invalide, renvoi message Unauthorized
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      // Mon token est valide et je peux continuer
      req.user = user;
      // J'envoie les infos de user
      // On crée une clé "user" dans req. La route dans laquelle le middleware est appelé pourra avoir accès à req.user
      return next();
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
