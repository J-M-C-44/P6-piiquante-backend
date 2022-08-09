'use strict';
const Sauce = require('../models/sauce');
const fs = require('fs');


exports.getAllSauces = (req, res, next) => {
    console.log('getAllSauces');
    Sauce.find()
        .then(sauces => {
            console.log('getAllSauces ok');
            return res.status(200).json(sauces);            
        })
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    console.log('getOneSauce');
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        console.log('getOneSauce ok');
        return res.status(200).json(sauce);            
    })
    .catch(error => res.status(400).json({ error }));
};

exports.createSauce = (req, res, next) => {
    console.log('createSauce, body = ', req.body );
    
    const sauceObject = JSON.parse(req.body.sauce);
    console.log('sauceObject = ', sauceObject );

    // ICIJCO ajouter contrôle des entrées
    const sauce = new Sauce({
    //    ...sauceObject,
        // imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
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
    .then(() => { res.status(201).json({message: 'sauce enregistrée !'})})

    .catch((error) => {
        // si pb, on fait retour arrière sur le fichier
        fs.unlink('images/'+req.file.filename,(err) => {
            if (err) {
                console.log('impossible de supprimer le fichier image ', oldFilename, ' erreur : ', err );
            } else { 
                console.log('pb sur insertion bdd sauce, retour arrière : fichier ', req.file.filename, ' supprimé');
            }
         });
        res.status(401).json({ error });
    });
};

exports.modifySauce = (req, res, next) => {
    console.log('modifySauce');
    
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    
    if (sauceObject.userId != req.auth.userId) {
        console.log('! tentative piratage, sauceObject.userId = ', sauceObject.userId, ' <> req.auth.userId =   ', req.auth.userId );
        res.status(403).json({ message : 'Not authorized'});
    } else {
        Sauce.findOne({_id: req.params.id})
        
        .then((sauce) => {
            console.log('findOne OK, sauce = ', sauce);
            if (sauce.userId != req.auth.userId) {
                // on fait retour arrière sur le fichier
                fs.unlink('images/'+req.file.filename,(err) => {
                    if (err) {
                        console.log('impossible de supprimer le fichier image ', oldFilename, ' erreur : ', err );
                    } else { 
                        console.log('tentative de modification d une image non propriétaire, retour arrière : fichier ', req.file.filename, ' supprimé');
                    }
                });
                res.status(403).json({ message : 'Not authorized'});
                
            } else {
                const oldFilename = sauce.imageUrl.split("/images/")[1];
                console.log('oldFilename = ', oldFilename);
                // on conserve l'URL initiale en absence de fichier
                if (!req.file) {
                    sauceObject.imageUrl = sauce.imageUrl;
                    console.log('sauceObject.imageUrl= ', sauceObject.imageUrl);
                };
                // console.log('sauceObject= ', sauceObject);
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
                    console.log('update db ok');
                    // delete fichier précédent
                    if (req.file) {
                        fs.unlink('images/'+oldFilename,(err) => {
                            if (err) {
                                console.log('impossible de supprimer le fichier image ', oldFilename, ' erreur : ', err );
                            }
                         });
                    }
                    res.status(200).json({message : 'Sauce modifiée!'})  
                })
                   
                .catch((error) => {
                    console.log('update KO !');
                    res.status(401).json({ error });
                });
            }
        })
        .catch((error) => {
            console.log(' pb findOne; erreur : ', error);
            res.status(400).json({ error });
        });
    }

};

exports.deleteSauce = (req, res, next) => {
    console.log('deleteSauce');

    console.log('req.params.id = ', req.params.id);
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
        // console.log('findOne OK, sauce = ', sauce);
        if (sauce.userId != req.auth.userId) {
            res.status(403).json({ message : 'Not authorized'});
        } else {
            const oldFilename = sauce.imageUrl.split("/images/")[1];
            console.log('oldFilename = ', oldFilename);

            Sauce.deleteOne({ _id: req.params.id})

            .then(() => {
                console.log('delete db ok');
                // delete fichier précédent
                fs.unlink('images/'+oldFilename,(err) => {
                    if (err) {
                        console.log('impossible de supprimer le fichier image ', oldFilename, ' erreur : ', err );
                    }
                });

                res.status(200).json({message : 'Sauce supprimée!'})  
            })
                
            .catch((error) => {
                console.log('update KO !');
                res.status(401).json({ error });
            });
        }
    })
    .catch((error) => {
        res.status(400).json({ error });
    });

};

exports.evaluateSauce = (req, res, next) => {
    console.log('evaluateSauce');

    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            console.log('findOne OK, sauce = ', sauce);
            let allreadyLiked = false;
            let allreadyDisliked = false;
            // recherche si user à déjà liké ou disliké
            if (sauce.usersLiked.includes(req.auth.userId)) {
                allreadyLiked = true;
                console.log('allreadyLiked ', allreadyLiked );
            }
            if (sauce.usersDisliked.includes(req.auth.userId)) {
                allreadyDisliked = true;
                console.log('allreadyDisliked ', allreadyDisliked );
            }    
                      
            switch (req.body.like) {
                case 1:
                    console.log('like = 1');
                    if (allreadyLiked) {
                        console.log('déjà un like pour le user : ', req.auth.userId);
                        res.status(403).json({ message : 'Not authorized'})
                    } else {
                        // if (allreadyDisliked) {
                        //     Sauce.updateOne({ _id: req.params.id}, 
                        //         { 
                        //         $inc: { likes: 1 },
                        //         $push: { usersLiked: req.auth.userId },
                        //         $inc: { likes: -1 },
                        //         $pull: { usersDisliked: req.auth.userId }  
                        //         }
                        // } else {
                        //     Sauce.updateOne({ _id: req.params.id}, 
                        //         { 
                        //         $inc: { likes: 1 },
                        //         $push: { usersLiked: req.auth.userId }, 
                        //         }
                        // }
                        // then(() => {
                        //     console.log('update db like =1 ok');
                        //     res.status(200).json({message : 'Sauce modifiée!'})  
                        // })
                        // .catch((error) => {
                        //     console.log('update db like =1 KO !');
                        //     res.status(401).json({ error });
                        // });
                        console.log('avant sauce.likes++');
                        sauce.likes++;
                        console.log('sauce.likes++');
                        sauce.usersLiked.push(req.auth.userId);
                        
                        if (allreadyDisliked)
                           if (sauce.dislikes < 1) {
                                sauce.dislikes = 0
                           } else {
                                 sauce.dislikes--
                           }
                           sauce.usersDisliked = sauce.usersDisliked.filter((userId) => ( !(userId == req.auth.userId) ));
                        }
                    break;

                case 0:
                    console.log('like = 0');    
                    if (allreadyLiked) {
                        if (sauce.likes < 1) {
                            console.log('sauce.likes <1');
                            sauce.likes = 0
                       } else {
                             sauce.likes--
                             console.log('sauce.likes --', sauce.likes );
                       }
                       sauce.usersLiked = sauce.usersLiked.filter((userId) => ( !(userId == req.auth.userId) ));
                       console.log('sauce.usersLiked filter', sauce.usersLiked);
                    }
                    if (allreadyDisliked) {
                        if (sauce.dislikes < 1) {
                            sauce.dislikes = 0
                       } else {
                             sauce.dislikes--
                       }
                       sauce.usersDisliked = sauce.usersDisliked.filter((userId) => ( !(userId == req.auth.userId) ));
                    }                 
                    break;

                case -1:
                    console.log('like = -1');
                    if (allreadyDisliked) {
                        console.log('déjà un dislike pour le user : ', req.body.userId);
                        res.status(403).json({ message : 'Not authorized'})
                    } else {

                        sauce.dislikes++;
                        sauce.usersDisliked.push(req.auth.userId);
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

                default:
                    console.log('valeur de like non autorisée : ', req.body.like);
                    res.status(403).json({ message : 'Not authorized'})                          
            } 

            Sauce.updateOne({ _id: req.params.id}, 
                { 
                likes: sauce.likes,
                dislikes: sauce.dislikes,
                usersLiked: sauce.usersLiked,
                usersDisliked : sauce.usersDisliked
                }
            )
            .then(() => {
                console.log('update db like/dislike ok');
                res.status(200).json({message : 'mise à jour like/dislike effectuée!'})  
            })
                
            .catch((error) => {
                console.log('update KO !');
                res.status(401).json({ error });
            });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });


};

