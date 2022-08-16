'use strict';

// <------------------------------------- imports --------------------------------------->
// pour faciliter gestion de mongo DB
const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
  userId:        { type: String,   required: true },
  name:          { type: String,   required: true, trim: true },
  manufacturer:  { type: String,   required: true, trim: true },
  description:   { type: String,   required: true, trim: true },
  mainPepper:    { type: String,   required: true, trim: true },
  imageUrl:      { type: String,   required: true },
  heat:          { type: Number,   required: true, min : 0, max : 10 },
  likes:         { type: Number,   required: true, min :0, défault:0 },
  dislikes:      { type: Number,   required: true, min :0, default:0 },
  usersLiked:    { type: [String], required: true},
  usersDisliked: { type: [String], required: true}
});


module.exports = mongoose.model('Sauce', sauceSchema);