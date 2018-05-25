const express = require("express"),
  router = express.Router(),
  isAuthentificated = require("./utils/isAuthentificated"),
  mongoose = require('mongoose');

const User = mongoose.model('Users');
const Offer = require("./../models/Offer");

router.get("/offers/archives", isAuthentificated, (req, res, next) => {
  let user = usr;
  if (user.organizationType === "Association") {
    Offer.find({
        is_archive: true,
        association: user.association
      })
      .populate('association')
      .populate('users')
      .then(offers => {
        -res.render("offers/archives", {
          title: 'Anatomik - Archives Offres',
          offers: offers,
          user: user,
          archive: true
        });
      });
  } else {
    Offer.find({
      is_archive: false
    }).then(offers => {
      res.render("offers/index", {
        title: 'Anatomik - Archives Offres',
        offers: offers
      });
    });
  }
});

router.get("/offers/new", isAuthentificated, (req, res, next) => {
  let user = usr;
  if (user.organizationType == "Association") {
    var offer = new Offer();
    res.render("offers/new", {
      title: 'Anatomik - Nouvelle offre',
      offer: offer,
      endpoint: "/offers",
      user: user,
      errors: false
    });
  } else {
    Offer.find({
      is_archive: false
    }).then(offers => {
      res.render("offers/index", {
        title: 'Anatomik - Nouvelle offre',
        offers: offers,
        user: user
      });
    });
  }
});

router.get("/offers/:page?", isAuthentificated, (req, res, next) => {
  let user = usr;
  let perPage = 10
  let page = req.params.page || 1
  if (user.organizationType === "Association") {
    Offer.find({
        is_archive: false,
        association: user.association
      })
      .populate('association')
      .populate('user')
      .populate('etablissement')
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .sort({
        created_at: 'desc'
      })
      .exec(function (err, offers) {
        Offer.count().exec(function (err, count) {
          res.render("offers/index", {
            title: 'Anatomik - Offres',
            offers: offers,
            user: user,
            archive: false,
            current: page,
            pages: Math.ceil((count) / perPage)
          });
        });
      });
  } else {
    Offer.find({
        is_archive: false
      })
      .populate('association')
      .populate('user')
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .sort({
        created_at: 'desc'
      })
      .exec(function (err, offers) {
        Offer.count().exec(function (err, count) {
          res.render("offers/index", {
            title: 'Anatomik - Offres',
            offers: offers,
            user: user,
            current: page,
            pages: Math.ceil((count) / perPage)
          });
        });
      });
  }
});

router.get("/offers/edit/:id", isAuthentificated, (req, res, next) => {
  let user = usr;
  if (user.organizationType == "Association") {
    Offer.findById(req.params.id).then(
      offer => {
        res.render("offers/edit", {
          title: 'Anatomik - Editer ' + offer.name,
          offer: offer,
          user: user,
          endpoint: "/offers/" + offer.id.toString(),
          errors: false
        });
      },
      err => res.status(500).send(err)
    );
  } else {
    Offer.find({
      is_archive: false
    }).then(offers => {
      res.render("offers/index", {
        title: 'Anatomik - Offres',
        offers: offers
      });
    });
  }
});

router.get("/offers/:id", isAuthentificated, (req, res, next) => {
  let user = usr;
  Offer.findById(req.params.id).populate('association').then(offer => {
      res.render("offers/show", {
        title: 'Anatomik - Offre ' + offer.name,
        offer: offer,
        user: user
      });
    },
    err => res.status(500).send(err)
  );
});

router.post("/offers/:id?", isAuthentificated, (req, res) => {
  let user = usr;
  let err = []
  if (user.organizationType == "Association") {
    new Promise((resolve, reject) => {
        if (req.params.id) {
          Offer.findById(req.params.id).then(resolve, reject);
        } else {
          resolve(new Offer());
        }
      })
      .then(offer => {
        if (req.body.name) {
          offer.name = req.body.name;
        } else {
          err.push('Le nom de l\'offre ne peut pas être vide')
        }
        if (req.body.description) {
          offer.description = req.body.description;
        } else {
          err.push('La description de l\'offre ne peut pas être vide')
        }
        if (req.body.domaine) {
          offer.domaine = req.body.domaine;
        } else {
          err.push('Le domaine de l\'offre ne peut pas être vide')
        }
        if (req.body.price) {
          offer.price = req.body.price;
        } else {
          err.push('Le prix de l\'offre ne peut pas être vide')
        }
        if (req.body.delai) {
          offer.delai = req.body.delai;
        } else {
          err.push('Le delai de l\'offre ne peut pas être vide')
        }
        if (req.body.is_archive === 'true' || req.body.is_archive === 'false') {
          offer.is_archive = req.body.is_archive;
        } else {
          err.push('Erreur dans l\'archivage')
        }
        offer.created_at = Date.now();
        offer.association = user.association;
        offer.etablissement = user.etablissement;

        if (user.telephone) {
          offer.telephone = user.telephone
        } else if (user.etablissement && user.etablissement.telephone) {
          offer.telephone = user.etablissement.telephone
        } else {
          offer.telephone = user.association.telephone
        }

        if (user.etablissement && user.etablissement.adresse) {
          offer.adresse = user.etablissement.adresse
        } else {
          offer.adresse = user.association.adresse
        }

        if (offer.adresse == undefined) {
          err.push("Erreur dans l'adresse de l'appel d'offre")
        }
        if (offer.telephone == undefined) {
          err.push("Erreur dans le téléphone de l'appel d'offre")
        }
        offer.user = user.id;

        if (err.length > 0) {
          res.render('offers/edit', {
            offer: offer,
            user: user,
            endpoint: "/offers",
            errors: err
          })
        } else {
          return offer.save();
        }
      })
      .then(() => {
        res.redirect("/offers/1");
      });
  } else {
    Offer.find({
      is_archive: false
    }).then(offers => {
      res.render("offers/index", {
        title: 'Anatomik - Offres',
        offers: offers
      });
    });
  }
});

module.exports = router;