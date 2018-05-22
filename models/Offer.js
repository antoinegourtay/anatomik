const mongoose = require('mongoose');

let OfferSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  is_archive: Boolean,
  domaine: String,
  delai: String,
  created_at: Date,
  adresse: String,
  telephone: String,
  etablissement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etablissement'
  },
  association: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Association'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
});


module.exports = mongoose.model('Offer', OfferSchema);
