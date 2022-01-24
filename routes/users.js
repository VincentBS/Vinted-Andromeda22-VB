// Imports des packages
const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// Import des modèles
const User = require("../models/User");

// Création d'un compte User - Route SignUp
router.post("/user/signup", async (req, res) => {
  try {
    // On vérifie qu'un username a bien été renseigné
    if (req.fields.username === undefined) {
      res.status(400).json({ message: "Username is required" });
    } else {
      // On vérifie que l'email renseigné soit bien disponible en BDD
      const isUserExist = await User.findOne({ email: req.fields.email });
      if (isUserExist !== null) {
        res.status(400).json({ message: "This email already has an account" });
      } else {
        console.log(req.fields);

        //Etape 1 : Hasher le mot de passe
        const salt = uid2(64);
        const hash = SHA256(req.fields.password + salt).toString(encBase64);
        const token = uid2(64);
        //   console.log("salt==>", salt);
        //   console.log("hash==>", hash);

        //Etape 2 : Créer le nouvel utilisateur
        const newUser = new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
            avatar: Object, // nous verrons plus tard comment uploader une image
          },
          token: token,
          hash: hash,
          salt: salt,
        });

        // Etape 3 : Sauvegarder ce nouvel utilisateur dans la bdd
        await newUser.save();
        res.json({
          _id: newUser._id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
        });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Connexion à un compte User existant - Route LogIn
router.post("/user/login", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.fields.email });
    if (existingUser === null) {
      res.status(401).json({ message: "Unauthorized !" });
    } else {
      console.log(existingUser.hash, "Hash à comparer");
      const newHash = SHA256(req.fields.password + existingUser.salt).toString(
        encBase64
      );
      console.log(newHash, "Mon nouveau hash");
      if (existingUser.hash === newHash) {
        res.json({
          _id: existingUser._id,
          token: existingUser.token,
          account: existingUser.account,
        });
      } else {
        res.status(401).json({ message: "Unauthorized !" });
      }
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

module.exports = router;
