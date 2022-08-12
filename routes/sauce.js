// dans routes
'use strict';

// <------------------------------------- imports --------------------------------------->
// express et création router
const express = require('express');
const router = express.Router();

// middleware :
//  - authorize : pour vérifier l'authentification (via token jwt)
//  - multer: pour gérer les fichiers entrants 
//  - checkSauceData : pour contrôler les entrées name, manufacturer, description, main pepper et heat
//  - checkSauceData : pour contrôler l' entrée like
const authorize = require("../middleware/authorize")
const multer = require('../middleware/multer-config');
const checkSauceData = require('../middleware/checkSauceData');
const checkLike = require('../middleware/checkLike');

// Controller :
const sauceCtrl = require('../controllers/sauce');

// Routes
// récupération de toutes les sauces
router.get('/',          authorize,                         sauceCtrl.getAllSauces);
// récupération du détail d'une sauce
router.get('/:id',       authorize,                         sauceCtrl.getOneSauce);
// création d'une sauce (fichier en entrée)
router.post('/',         authorize, multer, checkSauceData, sauceCtrl.createSauce);
// évaluation d'une sauce (like, dislike)
router.post('/:id/like', authorize,         checkLike,      sauceCtrl.evaluateSauce);
// modification d'une sauce (fichier en entrée possible)
router.put('/:id',       authorize, multer, checkSauceData, sauceCtrl.modifySauce);
// suppression d'une sauce
router.delete('/:id',    authorize,                         sauceCtrl.deleteSauce);

module.exports = router;