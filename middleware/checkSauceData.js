'use strict';

const charAndDigitTypeRegexpMax = new RegExp('^[a-zàâéèëêïîôùüûçœ0-9][a-zàâéèëêïîôùüûçœ0-9\'’,.!?_-\\s]{1,248}[a-zàâéèëêïîôùüûçœ0-9.!?\\s]$','i');
const charAndDigitTypeRegexpMedium = new RegExp('^[a-zàâéèëêïîôùüûçœ0-9][a-zàâéèëêïîôùüûçœ0-9\'’ !_-]{1,58}[a-zàâéèëêïîôùüûçœ0-9!]$','i');
const charTypeRegexpMin = new RegExp('^[a-zàâéèëêïîôùüûçœ][a-zàâéèëêïîôùüûçœ0\'’ _-]{1,28}[a-zàâéèëêïîôùüûçœ]$','i');
const DigitTypeRegexp = new RegExp('^[0-9]{1,2}$','i');


module.exports = (req, res, next) => {
    console.log('controle data');
    let sauceObject = {};
    if (req.file) {
        sauceObject = JSON.parse(req.body.sauce);  
    } else {
        sauceObject = req.body ;
    }

    // check name
    if (charAndDigitTypeRegexpMedium.test(sauceObject.name) == false ) {
        console.log('donnée name invalide : ', sauceObject.name);
        return res.status(400).json({ message:'Name invalid. Accepted (60 max) : a-z,à â é è ë ê ï î ô ù ü û ç œ \'  - _ 0-9' });
    } 
    // check manufacturer
    if (charAndDigitTypeRegexpMedium.test(sauceObject.manufacturer) == false ) {
        console.log('donnée manufacturer invalide : ', sauceObject.manufacturer);
        return res.status(400).json({ message:'Manufacturer invalid. Accepted (60 max) : a-z,à â é è ë ê ï î ô ù ü û ç œ \'  - _ 0-9' });
    }
    // Check description
    if (charAndDigitTypeRegexpMax.test(sauceObject.description) == false ) {
        console.log('donnée descriptionr invalide : ', sauceObject.description);
        return res.status(400).json({ message:'Description invalid. Accepted (250 max) : a-z,à â é è ë ê ï î ô ù ü û ç œ \'  - _ 0-9' });
    }
    // Check main pepper
    if (charTypeRegexpMin.test(sauceObject.mainPepper) == false ) {
        console.log('donnée main pepper invalide : ', sauceObject.mainPepper);
        return res.status(400).json({ message:'main pepper invalid. Accepted (30 max) : a-z,à â é è ë ê ï î ô ù ü û ç œ \'  - _' });
    }
    // checkHeat
    if ( (DigitTypeRegexp.test(sauceObject.heat) == false) || 
         (Number.isInteger(Number(sauceObject.heat)) == false) || 
         (sauceObject.heat < 1) ||
         (sauceObject.heat > 10) ) { 
            console.log('donnée heat invalide : ', sauceObject.heat);
            return res.status(400).json({ message:'heat invalid. Accepted numeric integer between 1 and 10' });
    }
    
	next();
};