'use strict';
const passwordValidator = require('password-validator');

// Create a schema
const passwordSchema = new passwordValidator();

// Add properties to it
passwordSchema
.is().min(8)                                    // longueur minimale
.is().max(100)                                  // longueur maximale
.has().uppercase()                              // doit avoir des majuscules
.has().lowercase()                              // doit avoir des minuscules
.has().digits(2)                                // doot avoir au moins 2 chiffres
.has().not().spaces()                           // pas d'espaces
.is().not().oneOf(['Passw0rd', 'Password123', 'Azerty123', '@zerty123', 'Qwerty123', 'Qw€rty123']); // Blacklist


module.exports = (req, res, next) => {
    if (passwordSchema.validate(req.body.password)) {
        next();
    } else {
        res.status(400).json({ message : 'invalid password'});;
    }
  };
