'use strict';
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config('../.env');
 
module.exports = (req, res, next) => {
   try {
        // console.log('req = ', req );
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
       const userId = decodedToken.userId;
       // on vérifie si on a un user id dans le body et si celui ci est le même que celui issu du token
       if (req.body.userId && req.body.userId !== userId) {
            throw "403: unauthorized request";
        } else { 
            req.auth = { userId: userId };
        };
       console.log('req.auth = ', req.auth );
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};