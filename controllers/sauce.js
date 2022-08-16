'use strict';
// <------------------------------------- imports --------------------------------------->
// models
const Sauce = require('../models/sauce');

// fonction mutualisée de suppression de fichier
const removeImageFile = require('../utils/removeFile');


// <------------------------------ Controller "getAllSauces" ---------------------------->
/**
* récupère l'ensemble des sauces dans la BDD Sauce
*   - si OK: renvoie satut 200
*   - si ko : renvoie statut 400
*/
exports.getAllSauces = (req, res, next) => {
    // console.log('getAllSauces');
    Sauce.find()
        .then(sauces => {
            // console.log('getAllSauces ok');
            return res.status(200).json(sauces);            
        })
        .catch(error => res.status(400).json({ error }));
};

// <------------------------------ Controller "getOneSauce" ---------------------------->
/**
* récupère la sauce souhaitée dans la BDD Sauce à partir de son ID transmis en paramètre
*   - si OK: renvoie satut 200
*   - si ko : renvoie statut 404
*/
exports.getOneSauce = (req, res, next) => {
    // console.log('getOneSauce');
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        // console.log('getOneSauce ok');
        return res.status(200).json(sauce);            
    })
    .catch(error => res.status(404).json({ error }));
};

// <------------------------------ Controller "createSauce" ---------------------------->
/**
* crée une nouvelle sauce dans la BDD Sauce :
*   - remarque : contrôle des entrées effectuées au préalable dans le middleware checkSauceData.js
*   - récupération de l'objet sauce dans le body
*   - création enreg sauce  à partir de infos fournies dans l'object sauce + initialisation des autres champs
*   - si OK: renvoi satut 201
*   - si KO : suppression du fichier transmis et renvoie statut 400 
*/
exports.createSauce = (req, res, next) => {
    // console.log('createSauce, body = ', req.body );
    // récupération de l'objet sauce 
    const sauceObject = JSON.parse(req.body.sauce);

    const sauce = new Sauce({
    //  pas d'utilisation de ...sauceObject pour être certain de ne créer que les champs souhaités
        userId:         req.auth.userId,
        name:           sauceObject.name,
        manufacturer:   sauceObject.manufacturer,
        description:    sauceObject.description,  
        mainPepper:     sauceObject.mainPepper,
        imageUrl:       `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        heat:           sauceObject.heat,
        likes:          0,
        dislikes:       0,
        usersLiked:     [],
        usersDisliked:  []
    });

    sauce.save()
    .then(() => { res.status(201).json({message: 'sauce registered'})})

    .catch((error) => {
        // si pb, on fait retour arrière sur le fichier transmis et qui a été enregistrer avec multer
        removeImageFile(req.file.filename);
        res.status(400).json({ error });
    });
};

// <------------------------------ Controller "modifySauce " ---------------------------->
/**
* modifie une sauce existante dans la BDD Sauce à partir de son ID transmis en paramètre :
*   - remarque : contrôle des entrées effectuées au préalable dans le middleware checkSauceData.js
*   - récupération de l'objet sauce dans le body (gestion d'avec ou sans fichier)
*   - recherche de l'enregistrement demandé en BDD Sauce 
*   - contrôles sur les userId : celui fournit doit correspondre à celui qui fait la demande + celui associé à la sauce, sinon suppression du fichier transmis et renvoie statut 403 
*   - mise à jour des informations en BDD
*   - si OK: suppression de l'ancien fichier image et renvoi satut 201
*   - si KO : suppression du nouveau fichier transmis et renvoie statut 404 ou 500 
*/
exports.modifySauce = (req, res, next) => {
    // console.log('modifySauce');

    // récupération de l'objet sauce 
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    // pré-contrôle : le userID fourni doit correspondre à celui qui fait la demande
    if (sauceObject.userId != req.auth.userId) {
        console.log('! tentative piratage ? sauceObject.userId = ', sauceObject.userId, ' <> req.auth.userId =   ', req.auth.userId );
        // on fait retour arrière sur l'éventuel fichier transmis
        if (req.file) { 
            removeImageFile(req.file.filename);
        };
        res.status(403).json({ message : 'Not authorized'});

    } else {
    // recherche de l'enregistrement demandé en BDD Sauce 
        Sauce.findOne({_id: req.params.id})
        
        .then((sauce) => {
            // console.log('findOne OK, sauce = ', sauce);          
            // controle que le userID du demandeur correspond bien à celui du créateur de la sauce
            if (sauce.userId != req.auth.userId) {
                // on fait retour arrière sur l'éventuel fichier transmis
                if (req.file) { 
                    removeImageFile(req.file.filename);
                };
                res.status(403).json({ message : 'Not authorized'});
                
            } else {
            // mise à jour de l'enregistrement demandé en BDD Sauce 
                const oldFilename = sauce.imageUrl.split("/images/")[1];
                // console.log('oldFilename = ', oldFilename);
                // sans nouveau fichier image transmis, on conserve l'URL initiale 
                if (!req.file) {
                    sauceObject.imageUrl = sauce.imageUrl;
                };
                
                Sauce.updateOne({ _id: req.params.id}, 
                    { 
                    name:           sauceObject.name,
                    manufacturer:   sauceObject.manufacturer,
                    description:    sauceObject.description,  
                    mainPepper:     sauceObject.mainPepper,
                    imageUrl:       sauceObject.imageUrl,
                    heat:           sauceObject.heat,
                    }
                )
                .then(() => {
                    // delete fichier précédent si besoin
                    if (req.file) {
                        removeImageFile(oldFilename);      
                    }
                    res.status(200).json({message : 'Sauce modified'})
                })
                   
                .catch((error) => {
                    console.log('update DB KO (modifySauce)!');
                    // si pb, on fait retour arrière sur l'éventuel fichier transmis
                    if (req.file) {
                        removeImageFile(req.file.filename);      
                    }
                    res.status(500).json({ error });
                });
            }
        })
        .catch((error) => {
            console.log(' pb findOne (modifySauce); erreur : ', error);
            res.status(404).json({ error });
        });
    }

};

// <------------------------------ Controller "deleteSauce" ---------------------------->
/**
* supprime une sauce existante dans la BDD Sauce à partir de son ID transmis en paramètre :
*   - recherche de l'enregistrement demandé en BDD Sauce 
*   - contrôle que le userID du demandeur correspond bien à celui du créateur de la sauce, sinon suppression du fichier transmis et renvoie statut 403  
*   - suppression de l'enregistrement en BDD
*   - si OK: suppression de l'ancien fichier image et renvoi satut 200
*   - si KO : renvoie statut 400 ou 500 
*/
exports.deleteSauce = (req, res, next) => {
    // console.log('deleteSauce');
    // recherche de l'enregistrement demandé en BDD Sauce  
    Sauce.findOne({_id: req.params.id})

    .then((sauce) => {
        // contrôle que le userID du demandeur correspond bien à celui du créateur de la sauce
        if (sauce.userId != req.auth.userId) {
            res.status(403).json({ message : 'Not authorized'});
        } else {
        // suppression de l'enregistrement en BDD
            const oldFilename = sauce.imageUrl.split("/images/")[1];
            Sauce.deleteOne({ _id: req.params.id})

            .then(() => {
                // console.log('delete db ok');
                // delete du fichier correspondant
                removeImageFile(oldFilename);
                res.status(200).json({message : 'Sauce deleted !'})  
            })
                
            .catch((error) => {
                console.log('delete DB KO !');
                res.status(500).json({ error });
            });
        }
    })
    .catch((error) => {
        res.status(400).json({ error });
    });

};

// <------------------------------ Controller "evaluateSauce" ---------------------------->
/**
* change la notation d'une sauce existante dans la BDD Sauce à partir de son ID transmis en paramètre :
*   - remarque : contrôle des entrées effectuées au préalable dans le middleware checkLike.js
*   - recherche de l'enregistrement demandé en BDD Sauce 
*   - contrôle que le demandeur ne demande pas un 2eme like ou dislike (renvoi 403 sinon)
*   - selon réception 
        - d'un like (1) ou dislike (-1) : incrémentation du nb de likes ou dislikes et ajout au tableau des likeurs/dislikeurs
        - d'une annnulation (0) : décrémentation du nb de likes ou dislikes et supression dans le tableau des likeurs/dislikeurs
*   - si OK:  MAJ de l'enregistrement en BDD et renvoi satut 200
*   - si KO : renvoie statut 400 ou 500 
*/
exports.evaluateSauce = (req, res, next) => {
    console.log('evaluateSauce');

    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            // console.log('findOne OK, sauce = ', sauce);
            // recherche si user à déjà liké ou disliké
            let allreadyLiked = false;
            let allreadyDisliked = false;
            
            if (sauce.usersLiked.includes(req.auth.userId)) {
                allreadyLiked = true;
            }
            if (sauce.usersDisliked.includes(req.auth.userId)) {
                allreadyDisliked = true;
            }  

            // traitement des différents cas de figure / like         
            switch (req.body.like) {
                // ajout d'un like
                case 1:
                    // contrôle que le demandeur n'a pas déjà un like
                    if (allreadyLiked) {
                        console.log('déjà un like pour le user : ', req.auth.userId);
                        res.status(403).json({ message : 'Not authorized'})
                    } else {
                    // si ok : +1 like et ajout userid au tableau
                        sauce.likes++;
                        sauce.usersLiked.push(req.auth.userId);

                        // gestion du cas d'erreur où le demandeur aurait un dislike [ne devrait logiquement pas de produire]
                        if (allreadyDisliked)
                           if (sauce.dislikes < 1) {
                                sauce.dislikes = 0
                           } else {
                                 sauce.dislikes--
                           }
                           sauce.usersDisliked = sauce.usersDisliked.filter((userId) => ( !(userId == req.auth.userId) ));
                        }
                    break;

                // suppression d'un like ou d'un dislike
                case 0: 
                    // s'il avait un like, on l'enlève
                    if (allreadyLiked) {
                        if (sauce.likes < 1) {
                            sauce.likes = 0
                       } else {
                             sauce.likes--
                       }
                       sauce.usersLiked = sauce.usersLiked.filter((userId) => ( !(userId == req.auth.userId) ));
                    }
                    // s'il avait un dislike, on l'enlève
                    if (allreadyDisliked) {
                        if (sauce.dislikes < 1) {
                            sauce.dislikes = 0
                       } else {
                             sauce.dislikes--
                       }
                       sauce.usersDisliked = sauce.usersDisliked.filter((userId) => ( !(userId == req.auth.userId) ));
                    }                 
                    break;

                // ajout d'un dislike
                case -1:
                    // contrôle que le demandeur n'a pas déjà un dislike
                    if (allreadyDisliked) {
                        console.log('déjà un dislike pour le user : ', req.body.userId);
                        res.status(403).json({ message : 'Not authorized'})
                    } else {
                    // si ok : +1 like et ajout userid au tableau
                        sauce.dislikes++;
                        sauce.usersDisliked.push(req.auth.userId);

                        // gestion du cas d'erreur où le demandeur aurait un like [ne devrait logiquement pas de produire]
                        if (allreadyLiked) {
                            if (sauce.likes < 1) {
                                sauce.likes = 0
                           } else {
                                 sauce.likes--
                           }
                           sauce.usersLiked = sauce.usersLiked.filter((userId) => ( !(userId == req.auth.userId) ));
                        }
                    } 
                    break;

                // valeurs non prévues/autorisées
                default:
                    console.log('valeur de like non autorisée : ', req.body.like);
                    res.status(400).json({ message : 'like invalid. Must be 1, 0 or -1'})                          
            } 
            // enregistrement en BDD
            Sauce.updateOne({ _id: req.params.id}, 
                { 
                likes: sauce.likes,
                dislikes: sauce.dislikes,
                usersLiked: sauce.usersLiked,
                usersDisliked : sauce.usersDisliked
                }
            )
            .then(() => {
                res.status(200).json({message : 'update like/dislike done'})  
            })
                
            .catch((error) => {
                console.log('update KO (evaluateSauce)!');
                res.status(500).json({ error });
            });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });

};

