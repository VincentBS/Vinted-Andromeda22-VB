// Imports des packages
const express = require("express");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

// Configuration de cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Import des modèles
const Offer = require("../models/Offer");
const isAuthenticated = require("../middleware/isAuthenticated");

// Création et publication d'une offre
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const { title, description, price, brand, size, condition, color, city } =
      req.fields;
    console.log(req.fields);
    if (title && price && req.files.picture.path) {
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ETAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
      });
      // Upload photo on Cloudinary
      const picture = req.files.picture.path;
      const result = await cloudinary.uploader.upload(picture);

      newOffer.product_image = result;

      // Je rajoute mon utilisateur
      newOffer.owner = req.user;

      await newOffer.save();
      res.json(newOffer);
    } else {
      res.status(400).json({
        message: "Title, price and picture are required to create an offer",
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Consultation des offres disponibles
router.get("/offers", async (req, res) => {
  try {
    // Gestion des filtres avec l'objet filters
    const filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, i);
    }
    if (req.query.priceMin) {
      filters.product_price = { $gte: req.query.priceMin };
    }
    // Si il y a déjà une clé product_price présente dans mon objet filters il faut que j'ajoute dans cette clé
    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = req.query.priceMax;
      } else {
        filters.product_price = {
          $lte: req.query.priceMax,
        };
      }
    }
    console.log(filters);

    // Gestion du tri avec l'objet sort
    const sort = {};
    if (req.query.sort === "price-desc") {
      sort.product_price = "desc";
    } else if (req.query.sort === "price-asc") {
      sort.product_price = "asc";
    }

    // Gestion de la pagination
    // Exemple : Pour 5 annonces par page
    // (1-1) * 5 = skip 0 annonces -> page 1
    // (2-1) * 5 = skip 5 annonces -> page 2
    // (4-1) * 5 = skip 15 annonces -> page 4

    let limit = 3;
    if (req.query.limit) {
      limit = req.query.limit;
    }

    let page = 1;
    if (req.query.page) {
      page = reqq.query.page;
    }

    const offers = await Offer.find(filters)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .select("product_name product_description product_price");

    const count = await Offer.countDocuments(filters);

    res.json({ count: count, offers: offers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Récupération des informations d'une offre en fonction de son id
router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// router.all("*", (req, res) => {
//   res.json({ error: error.message });
// });

module.exports = router;
