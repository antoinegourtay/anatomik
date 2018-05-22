const mongoose = require('mongoose');

let ServiceSchema = new mongoose.Schema({
  name: String,
  description: String,
  type: {
    type: String,
    trim: true,
  },
  date_debut: String,
  date_fin: String,
  is_archive: Boolean,
  adresse: String,
  created_at: Date,
  telephone: String,
  association: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Association'
  },
  etablissement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etablissement'
  },
  entreprise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entreprise'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
});

let Service = mongoose.model('Service', ServiceSchema);
module.exports = Service;