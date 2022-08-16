'use strict'
// <------------------------------------- imports --------------------------------------->
// Node file Systeme : pour gérer la suppression du fichier image sur le disque
const fs = require('fs');

// <---------------------------- fonction utilitaire "removeImageFile" --------------------------->
/**
* supprime le fichier image souhaité
*   @param { String } filename - nom du fichier image à supprimer 
*/
function removeImageFile(filename) {

    // console.log( 'remove fonction - filename to delete :', filename)    
    fs.unlink('images/'+filename,(err) => {
        if (err) {
            console.log('impossible de supprimer le fichier image ', filename, ' erreur : ', err );
        } else { 
            console.log('fichier image ', filename, ' supprimé');
        }
    });
}

module.exports = removeImageFile;