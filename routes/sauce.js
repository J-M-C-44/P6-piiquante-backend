// dans routes
'use strict';
const express = require('express');
const router = express.Router();
// const limiter = require("../middleware/limiter");
const authorize = require("../middleware/authorize")
const multer = require('../middleware/multer-config');
const sauceCtrl = require('../controllers/sauce');
const checkSauceData = require('../middleware/checkSauceData');
const checkLike = require('../middleware/checkLike');

router.get('/',          authorize,                         sauceCtrl.getAllSauces);
router.get('/:id',       authorize,                         sauceCtrl.getOneSauce);
router.post('/',         authorize, multer, checkSauceData, sauceCtrl.createSauce);
router.post('/:id/like', authorize,         checkLike,      sauceCtrl.evaluateSauce);
router.put('/:id',       authorize, multer, checkSauceData, sauceCtrl.modifySauce);
router.delete('/:id',    authorize,                         sauceCtrl.deleteSauce);

module.exports = router;