const mongoose = require('mongoose')

let EntrepriseSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  adresse: {
    type: String,
    trim: true,
  },
  complement_adresse:{
    type: String,
    trim: true,
  },
  code_postal: {
    type: String,
    trim: true,
  },
  ville: {
    type: String,
    trim: true,
  },
  pays: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
  },
  photo_couv: {
    type: String,
    trim: true
  },
  siret: {
    type: String,
    trim: true,
  },
  tva: {
    type: String,
    trim: true
  },
  statut: {
    type: String,
    trim: true,
  },
  telephone: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  contact: {
    type: String,
    trim: true,
  },
  site: {
    type: String,
    trim: true,
  },
  facebook: {
    type: String,
    trim: true
  },
  twitter: {
    type: String,
    trim: true,
  },
  linkedin: {
    type: String,
    trim: true,
  },
  instagram: {
    type: String,
    trim: true,
  },
  date_creation: {
    type: String,
    trim: true
  },
  domaine: {
    type: String,
    trim: true
  },
  is_archive: {
    type: Boolean,
  }
});

EntrepriseSchema.virtual('users', {
  ref: 'Users',
  localField: '_id',
  foreignField: 'entreprise'
});

EntrepriseSchema.virtual('phases', {
  ref: 'Subphases',
  localField: '_id',
  foreignField: 'entreprise'
});

let Entreprise = mongoose.model('Entreprise', EntrepriseSchema);

module.exports = Entreprise;