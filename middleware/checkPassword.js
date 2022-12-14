'use strict';
// <------------------------------------- imports --------------------------------------->
// package pour contrôle de la validité du password
const passwordValidator = require('password-validator');

// Creation d'un schéma décrivant les données attendues dans le password
const passwordSchema = new passwordValidator();

passwordSchema
.is().min(8)                                    // longueur minimale
.is().max(100)                                  // longueur maximale
.has().uppercase()                              // doit avoir des majuscules
.has().lowercase()                              // doit avoir des minuscules
.has().digits(2)                                // doit avoir au moins 2 chiffres
.has().symbols()                                // doit avoir au moins 1 caractère spécial
.has().not().spaces()                           // pas d'espaces
.is().not().oneOf(['Passw0rd', 'Password123', 'Azerty123', '@zerty123', 'Qwerty123', 'Qw€rty123']); // Blacklist


// <---------------------------- Middleware "checkPassword" --------------------------->
/**
* vérifie que la donnée password transmise pour l'enregistrement est valide (via password-validator)
*   - si KO : renvoi statut 400 
*/
module.exports = (req, res, next) => {
    if (passwordSchema.validate(req.body.password)) {
        next();
    } else {
         res.status(400).json( { message : 'invalid password. Must contain 8 to 100 characters, upper and lowercase letters, 2 digits, 1 special (space is forbidden)'} )
        // res.writeHead(
        //     400,
        //     '{"message":"invalid password. Must contain 8 to 100 characters, upper and lowercase letters, 2 digits, 1 special (space is forbidden)"}',
        //     {
        //         "content-type": "application/json",
        //     }
        // );
        // res.end("Format de mot de passe incorrect");
    }
  };

