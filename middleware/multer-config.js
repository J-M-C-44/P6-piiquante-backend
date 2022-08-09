const multer = require('multer');
const path = require("path");
const uuid = require ('uuid');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/webp': 'webp'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype];
    const fullname = Date.now() + '-' + uuid.v4().replace(/-/g, "")+ '.' + extension
    callback(null, fullname );
  }
});

// on ne prend en charge que les fichiers autorisés
const fileFilter = (req, file, callback) => {
    const testMimeType = MIME_TYPES[file.mimetype];
    if (testMimeType != undefined) {
         console.log('mimetype ok : ', file.mimetype );
        callback(null, true);
    } else {
        console.log('mimetype ko : ', file.mimetype );
        console.log('req.fileValidationError : ', req.fileValidationError );
        callback(new Error('format d image non pris en charge')) 
    }
};

// on limite la taille du fichier à 2 Mo 
const limits = { fileSize: 2097152 };

module.exports = multer({storage: storage, limits: limits, fileFilter: fileFilter}).single('image');