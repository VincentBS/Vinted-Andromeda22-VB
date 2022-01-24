// Imports des packages
require("dotenv").config();
const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const mongoose = require("mongoose");

// Création du serveur
const app = express();
app.use(formidable());
app.use(cors());

app.get("/", (req, res) => {
  res.json("Welcome on Vinted API !");
});

// Connexion à la BDD
// mongoose.connect("mongodb://localhost/Vinted");
mongoose.connect(process.env.MONGODB_URI);

// Import des routes
const usersRoutes = require("./routes/users");
app.use(usersRoutes);
const offersRoutes = require("./routes/offers");
app.use(offersRoutes);

// On démarre le serveur
// app.listen(3000, () => {
//   console.log("Server has started ! 🚀");
// });
app.listen(process.env.PORT, () => {
  console.log("Server has started ! 🚀");
});
