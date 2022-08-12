'use strict';
// <------------------------------------- imports --------------------------------------->
// pour faciliter gestion de mongo DB
const mongoose = require('mongoose');
// pour garantir l'unicité de l'email
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);