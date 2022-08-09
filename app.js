'use strict';
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config('../.env');
const path = require('path');
const helmet = require("helmet");
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER_NAME}.mongodb.net/${process.env.MONGODB_DATABASE_NAME}?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB OK'))
  .catch(() => console.log('Connexion à MongoDB KO !'));

app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
   next();
 });


app.use(express.json());

app.use(mongoSanitize());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

// export pour utilisation par server.js
module.exports = app;