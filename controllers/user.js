'use strict';
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config('../.env');
console.log('dotenv : ', dotenv);

//icijco : ajouter un controle des entrées ?
//icijco: gérer ceci => "Un plugin Mongoose doit assurer la remontée des erreurs issues de la base de données"

exports.signup = (req, res, next) => {
     console.log('signup');
    // haschage du mot de passe par bcrypt
    const rounds = Number(process.env.HASH_NUMBER)
    bcrypt.hash(req.body.password, rounds)
        // création de l'enregistrement user dans la BDD User + retour réponse
        .then(hash => {
            console.log('hash: ', hash);
            const user = new User({
                email: req.body.email,
                password: hash
            });
            console.log('user: ', user);
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
     console.log('login : ', req.body.email);
    // recherche de l'enregistrement dans la BDD User
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user === null) {
                console.log('user non trouvé'); 
                return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte'});
            }
            // verification que le mot de passe et le hash dans bdd User correspondent
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        // console.log('user trouvé mais mots de passe différents'); 
                        return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
                    }
                    console.log('token', process.env.TOKEN_SECRET);
                    res.status(200).json({
                        userId: user._id,
                        // on chiffre le token avec jwt
                        token: jwt.sign(
                           { userId: user._id },
                           // ICIJCO :  gérer le random ? 
                           process.env.TOKEN_SECRET,
                           { expiresIn: '24h' }
                        )
                    });
                })
                // si pb avec bcrypt
                .catch(error => res.status(500).json({ error }));
        })
        // si pb recherche bdd User
        .catch(error => res.status(500).json({ error }));
};