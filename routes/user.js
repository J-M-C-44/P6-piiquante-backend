// dans routes
'use strict';
const express = require('express');
const router = express.Router();
const limiter = require("../middleware/limiter");
const checkEmail = require("../middleware/checkEmail");
const checkPassword = require("../middleware/checkPassword");
const userCtrl = require('../controllers/user');

router.post('/signup', limiter.signupRate, checkEmail, checkPassword, userCtrl.signup);
router.post('/login', limiter.loginRate, userCtrl.login);

module.exports = router;