const express = require("express"),
  router = express.Router(),
  isAuthentificated = require("./utils/isAuthentificated"),
  Entreprise = require("./../models/Entreprise"),
  mongoose = require('mongoose'),
  async = require('async'),
  path = require('path'),
  User = mongoose.model('Users'),
  fs = require('fs'),
  formidable = require('formidable');


router.get("/entreprises/show/:page?", isAuthentificated, (req, res, next) => {
  let user = usr;
  let perPage = 10
  let page = req.params.page || 1
  if (user.organizationType === 'Anatomik') {
    Entreprise.find({
        is_archive: false
      })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .sort({
        name: 1
      })
      .exec(function (err, entreprises) {
        Entreprise.count().exec(function (err, count) {
          res.render("entreprises/index", {
            title: 'Anatomik - Entreprises',
            entreprises: entreprises,
            user: user,
            current: page,
            pages: Math.ceil((count) / perPage)
          });
        });
      });
  }
});

router.get("/entreprises/archives/:page?", isAuthentificated, (req, res, next) => {
  let user = usr;
  let perPage = 10
  let page = req.params.page || 1
  if (user.organizationType === "Anatomik") {
    Entreprise.find({
        is_archive: true
      })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .sort({
        name: 1
      })
      .exec(function (err, entreprises) {
        Entreprise.count().exec(function (err, count) {
          res.render("entreprises/archives", {
            title: 'Anatomik - Archives entreprises',
            entreprises: entreprises,
            user: user,
            current: page,
            pages: Math.ceil((count) / perPage)
          });
        });
      })
  }
});


router.get("/entreprise/new", isAuthentificated, (req, res, next) => {
  let user = usr;
  if (user.organizationType === "Anatomik") {
    var entreprise = new Entreprise();
    res.render("entreprises/new", {
      title: 'Anatomik - Nouvelle entreprise',
      entreprise: entreprise,
      endpoint: "/entreprise",
      user: user
    });
  } else {
    res.render("index", {
      user: user
    });
  }
});

router.get('/entreprises/archive/:id', isAuthentificated, (req, res) => {
  let user = usr;
  if (user.organizationType === "Anatomik") {
    new Promise((resolve, reject) => {
        if (req.params.id) {
          Entreprise.findById(req.params.id).then(resolve, reject);
        } else {
          resolve(new Association());
        }
      }).then(entreprise => {
        entreprise.is_archive = true
        entreprise.save(function (err) {
          if (err)
            console.log(err);
          return user;
        });
      })
      .then(() => {
        res.redirect("/entreprises/show/1");
      });
  } else {
    res.redirect('/')
  }
})

router.get("/entreprise/edit/:id", isAuthentificated, (req, res, next) => {
  let user = usr;
  if (user.organizationType == "Entreprise" || user.organizationType === "Anatomik") {
    Entreprise.findById(req.params.id).populate('users').then(entreprise => {
        let users = entreprise.users
        res.render("entreprises/edit", {
          title: 'Anatomik - Éditer ' + entreprise.name,
          entreprise: entreprise,
          users: users,
          user: user,
          endpoint: "/entreprise/" + entreprise.id.toString()
        });
      },
      err => res.status(500).send(err)
    );
  } else {
    res.render("/", {
      user: user
    });
  }
});

router.get("/entreprise/:id", isAuthentificated, (req, res) => {
  let user = usr
  Entreprise.findById(req.params.id).populate('users').then(entreprise => {
    if (entreprise.is_archive === true) {
      res.redirect('/');
    } else {
      let users = entreprise.users
      let admin = null
      if (user.organizationType === 'Entreprise') {
        if (user.entreprise.id == entreprise.id) {
          admin = 'admin'
        }
      }
      res.render("entreprises/show", {
        title: 'Anatomik - ' + entreprise.name,
        entreprise: entreprise,
        users: users,
        user: user,
        admin: admin
      });

    }
  });
});

router.post("/entreprise/:id?", isAuthentificated, (req, res) => {
  let user = usr;
  if (user.organizationType == "Anatomik" || user.organizationType == "Entreprise") {
    new Promise((resolve, reject) => {
        if (req.params.id) {
          Entreprise.findById(req.params.id).then(resolve, reject);
        } else {
          resolve(new Entreprise());
        }
      }).then(entreprise => {
        entreprise.name = req.body.name;
        entreprise.adresse = req.body.adresse
        entreprise.code_postal = req.body.code_postal
        entreprise.complement_adresse = req.body.complement_adresse
        entreprise.ville = req.body.ville
        entreprise.pays = req.body.pays
        entreprise.photo_couv = req.body.photo_couv
        entreprise.siret = req.body.siret
        entreprise.tva = req.body.tva
        entreprise.description = req.body.description
        entreprise.statut = req.body.statut
        entreprise.telephone = req.body.telephone
        entreprise.contact = req.body.contact
        entreprise.site = req.body.site
        entreprise.reseaux_sociaux = req.body.reseaux_sociaux
        entreprise.membre = req.body.membre
        entreprise.facebook = req.body.facebook
        entreprise.twitter = req.body.twitter
        entreprise.linkedin = req.body.linkedin
        entreprise.instagram = req.body.instagram
        entreprise.date_creation = req.body.date_creation
        entreprise.domaine = req.body.domaine
        entreprise.is_archive = req.body.is_archive


        return entreprise.save();
      })
      .then(() => {
        res.redirect("/");
      });
  } else {
    res.render("/", {
      user: user
    });
  }
});

router.post('/entreprise/photo/:idEntreprise', isAuthentificated, (req, res) => {
  const idEntreprise = req.params.idEntreprise;
  const form = formidable.IncomingForm();
  const pathToFolder = path.join(__dirname, '..', 'public/images/uploads/');

  form.parse(req);

  form.on('fileBegin', (name, file) => {
    file.path = path.join(pathToFolder, file.name);
  });

  form.on('file', (name, file) => {
    Entreprise.findById(idEntreprise)
      .then(entreprise => {
        entreprise.logo = file.name;
        entreprise.save();
      }).then(() => {
        res.redirect("/entreprise/" + idEntreprise);
      });
  });

});

module.exports = router;