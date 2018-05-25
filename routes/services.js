const express = require("express"),
  router = express.Router(),
  isAuthentificated = require("./utils/isAuthentificated"),
  mongoose = require('mongoose');

const User = mongoose.model('Users');
const Service = require("./../models/Service");

router.get('/services', isAuthentificated, (req, res) => {
  let user = usr
  Service.find({
    is_archive: false
  }).populate('user').sort({
    created_at: 'desc'
  }).then(services => {
    res.render('services/index', {
      title: 'Anatomik - Services',
      services: services,
      user: user
    });
  });
});

router.get('/services/archives', isAuthentificated, (req, res) => {
  let user = usr
  Service.find({
    is_archive: true,
    user: user.id
  })
  .populate('user').sort({
    created_at: 'desc'
  })
  .populate('user').then(services => {
    res.render('services/archive', {
      title: 'Anatomik - Archives services',
      services: services,
      user: user
    });
  });
});

router.get('/service/new_offre', isAuthentificated, (req, res) => {
  let user = usr
  let service = new Service()
  res.render('services/new', {
    title: 'Anatomik - Nouveau service',
    service: service,
    serviceType: 'offre',
    user: user,
    endpoint: "/service",
    errors: false,
    placeholderName: "Ex: Besoin d'un camion"
  });
});

router.get('/service/new_demande', isAuthentificated, (req, res) => {
  let user = usr
  let service = new Service()
  res.render('services/new', {
    title: 'Anatomik - Nouvelle demande',
    service: service,
    serviceType: 'demande',
    user: user,
    endpoint: "/service",
    errors: false,
    placeholderName: "Ex: Camion disponnible",
  });
});
router.get('/service/new_promotion', isAuthentificated, (req, res) => {
  let user = usr
  let service = new Service()
  res.render('services/new', {
    title: 'Anatomik - Nouvelle promotion',
    service: service,
    serviceType: 'promotion',
    user: user,
    endpoint: "/service",
    errors: false,
    placeholderName: ""
  });
});

router.get('/my-services', isAuthentificated, (req, res) => {
  let user = usr;
  Service.find({
    user: user.id
  })
  .populate('user').sort({
    created_at: 'desc'})
  .populate('users').then(services => {
    res.render('services/my-services', {
      title: 'Anatomik - Mes services',
      services: services,
      user: user
    });
  });
});

router.get('/service/edit/:id', isAuthentificated, (req, res) => {
  let user = usr;
  Service.findById(req.params.id).then(service => {

    res.render('services/edit', {
      title: 'Anatomik - Editer ' + service.name,
      service: service,
      user: user,
      serviceType: service.serviceType,
      endpoint: "/service/" + service.id.toString(),
      errors: false,
    });
  });
});

router.post('/service/:id?', isAuthentificated, (req, res) => {
  let user = usr;
  let err = [];

  new Promise((resolve, reject) => {
      if (req.params.id) {
        Service.findById(req.params.id).then(resolve, reject);
      } else {
        resolve(new Service());
      }
    })
    .then(service => {
      if (req.body.name) {
        service.name = req.body.name;
      } else {
        err.push('Le nom du service ne peut pas être vide')
      }
      if (req.body.description) {
        service.description = req.body.description;
      } else {
        err.push('La description du service ne peut pas être vide')
      }
      service.date_debut = req.body.date_debut;
      service.date_fin = req.body.date_fin;
      if (req.body.type === 'offre' ||  req.body.type === 'demande' ||  req.body.type === 'promotion') {
        service.type = req.body.type;
      } else {
        err.push('Erreur dans le type de service')
      }
      if (req.body.is_archive === 'true' || req.body.is_archive === 'false') {
        service.is_archive = req.body.is_archive;
      } else {
        err.push('Erreur dans l\'archivage')
      }
      service.user = user.id
      service.created_at = Date.now();
      service.association = user.association;
      service.etablissement = user.etablissement;

      if (user.organizationType === "Anatomik") {
        if (user.telephone) {
          service.telephone = user.telephone
        } else {
          service.telephone = ""
        }
      } else if (user.organizationType === "Association") {
        if (user.telephone) {
          service.telephone = user.telephone
        } else if (user.etablissement && user.etablissement.telephone) {
          service.telephone = user.etablissement.telephone
        } else if (user.association.telephone) {
          service.telephone = user.association.telephone
        } else {
          service.telephone = ""
        }
      } else if (user.organizationType === "Entreprise") {
        if (user.telephone) {
          service.telephone = user.telephone
        } else if (user.entreprise.telephone) {
          service.telephone = user.entreprise.telephone
        } else {
          service.telephone = ""
        }
      }

      if (user.organizationType === "Anatomik") {
        if (user.adresse) {
          service.adresse = user.adresse
        } else {
          service.adress = " "
        }
      } else if (user.organizationType === "Association") {
        if (user.adresse) {
          service.adresse = user.adresse
        } else if (user.etablissement && user.etablissement.adresse) {
          service.adresse = user.etablissement.adresse
        } else if (user.association.adress) {
          service.adresse = user.association.adresse
        } else {

        }
      } else if (user.organizationType === "Entreprise") {
        if (user.adress) {
          service.adresse = user.adresse
        } else if (user.entreprise.adress) {
          service.adresse = user.entreprise.adresse
        } else {
          service.adress = ""
        }
      }
      return service.save();
    })
    .then(() => {
      res.redirect("/services");
    });
})
module.exports = router;