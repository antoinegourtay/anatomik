const mongoose = require('mongoose')

let AssociationSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
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
    trim: true
  },
  photo_couv: {
    type: String,
    trim: true
  },
  finess: {
    type: String,
    trim: true,
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
  is_archive: {
    type: Boolean
  },
});

AssociationSchema.virtual('users', {
  ref: 'Users',
  localField: '_id',
  foreignField: 'association'
});
AssociationSchema.virtual('etablissements', {
  ref: 'Etablissement',
  localField: '_id',
  foreignField: 'association'
});
AssociationSchema.virtual('offers', {
  ref: 'Offer',
  localField: '_id',
  foreignField: 'association'
});

let Association = mongoose.model('Association', AssociationSchema);

module.exports = Association;
