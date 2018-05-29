const mongoose = require('mongoose')

let EtablissementSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    trim: true
  },
  raison_social: {
    type: String,
    trim: true
  },
  adresse : {
    type: String,
    trim: true
  },
  complement_adresse:{
    type: String,
    trim: true,
  },
  code_postal :{
    type: String,
    trim: true
  },
  ville : {
    type: String,
    trim: true
  },
  pays :{
    type: String,
    trim: true
  }, 
  telephone: {
    type: String,
    trim: true
  },
  mail :{
    type: String,
    trim: true
  },
  is_archive:{
    type: Boolean
  },
  association: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Association'
  },
})

EtablissementSchema.virtual('users', {
  ref: 'Users',
  localField: '_id',
  foreignField: 'etablissement'
});

EtablissementSchema.virtual('offers', {
  ref: 'Offer',
  localField: '_id',
  foreignField: 'etablissement'
});


let Etablissement = mongoose.model('Etablissement', EtablissementSchema);

module.exports = Etablissement;
