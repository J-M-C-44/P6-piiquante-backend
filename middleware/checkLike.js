'use strict';

module.exports = (req, res, next) => {
    console.log('controle like');
    console.log('req.body.like : ', req.body.like);
    if ( req.body.like == 1 || req.body.like == 0 || req.body.like == -1) {
        next();
    } else {
        console.log('donnée like invalide : ', req.body.like);
        return res.status(400).json({ message:'like invalid. Accepted : 1 0 -1' });   
    }
	
};