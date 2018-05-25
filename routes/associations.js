const express = require("express"),
  router = express.Router(),
  isAuthentificated = require("./utils/isAuthentificated"),
  Association = require("./../models/Association"),
  mongoose = require('mongoose'),
  path = require('path'),
  User = mongoose.model('Users'),
  formidable = require('formidable');

router.get("/associations/show/:page?", isAuthentificated, (req, res, next) => {
  let user = usr;
  let perPage = 20
  let page = req.params.page || 1
  if (user.organizationType === "Anatomik") {
    Association.find({
        is_archive: false
      })
      .select({ id: 1, name: 1, logo: 1 })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .sort({
        name: 1
      })
      .exec(function (err, associations) {
        Association.count().exec(function (err, count) {
          res.render("associations/index", {
            title: 'Anatomik - Associations',
            associations: associations,
            user: user,
            current: page,
            pages: Math.ceil((count) / perPage)
          });
        });
      })
  }
});

router.get("/associations/archives/:page?", isAuthentificated, (req, res, next) => {
  let user = usr;
  let perPage = 20
  let page = req.params.page || 1
  if (user.organizationType === "Anatomik") {
    Association.find({
        is_archive: true
      })
      .select({ id: 1, name: 1, logo: 1 })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .sort({
        name: 1
      })
      .exec(function (err, associations) {
        Association.count().exec(function (err, count) {
          res.render("associations/archive", {
            title: 'Anatomik - Archives associations',
            associations: associations,
            user: user,
            current: page,
            pages: Math.ceil((count) / perPage)
          });
        });
      })
  }
});


router.get("/association/new", isAuthentificated, (req, res, next) => {
  let user = usr;
  if (user.organizationType === "Anatomik") {
    var association = new Association();
    res.render("associations/new", {
      title: "Anatomik - Création d'une association",
      association: association,
      endpoint: "/association",
      user: user
    });
  } else {
    res.render("index", {
      user: user
    });
  }
});

router.get('/associations/archive/:id', isAuthentificated, (req, res) => {
  let user = usr;
  if (user.organizationType === "Anatomik") {
    new Promise((resolve, reject) => {
        if (req.params.id) {
          Association.findById(req.params.id).then(resolve, reject);
        } else {
          resolve(new Association());
        }
      }).then(association => {
        association.is_archive = true
        association.save(function (err) {
          if (err)
            console.log(err);
          return user;
        });
      })
      .then(() => {
        res.redirect("/associations/show/1");
      });
  } else {
    res.redirect('/')
  }
})

router.get("/association/edit/:id", isAuthentificated, (req, res, next) => {
  let user = usr;
  if (user.organizationType == "Association" ||  user.organizationType == "Anatomik") {
    Association.findById(req.params.id).populate('users').populate('etablissements').then(association => {
        let users = association.users
        let etablissements = association.etablissements
        res.render("associations/edit", {
          title: 'Anatomik - Editer ' + association.name,
          association: association,
          etablissements: etablissements,
          users: users,
          user: user,
          endpoint: "/association/" + association.id.toString()
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

router.get("/association/:id", isAuthentificated, (req, res) => {
  let user = usr
  Association.findById(req.params.id).populate('users').populate('etablissements').then(association => {
    if (association.is_archive == true) {
      res.redirect('/');
    } else {
      let users = association.users
      let etablissements = association.etablissements
      let admin = null
      if (user.organizationType === "Association") {
        if (user.association.id == association.id) {
          admin = 'admin'
        }
      }
      res.render("associations/show", {
        title: 'Anatomik - ' + association.name,
        association: association,
        etablissements: etablissements,
        users: users,
        user: user,
        admin: admin
      });
    }
  });
});

router.post("/association/:id?", isAuthentificated, (req, res) => {
  let user = usr;
  if (user.organizationType == "Anatomik" || user.organizationType == "Association") {
    new Promise((resolve, reject) => {
        if (req.params.id) {
          Association.findById(req.params.id).then(resolve, reject);
        } else {
          resolve(new Association());
        }
      }).then(association => {
        association.name = req.body.name
        association.adresse = req.body.adresse
        association.code_postal = req.body.code_postal
        association.complement_adresse = req.body.complement_adresse
        association.ville = req.body.ville
        association.pays = req.body.pays
        // if (req.files[0]) association.logo = req.files[0].filename
        association.photo_couv = req.body.photo_couv
        association.finess = req.body.finess
        association.description = req.body.description
        association.statut = req.body.statut
        association.telephone = req.body.telephone
        association.contact = req.body.contact
        association.site = req.body.site
        association.reseaux_sociaux = req.body.reseaux_sociaux
        association.membre = req.body.membre
        association.facebook = req.body.facebook
        association.twitter = req.body.twitter
        association.linkedin = req.body.linkedin
        association.instagram = req.body.instagram
        association.date_creation = req.body.date_creation
        association.is_archive = req.body.is_archive


        return association.save();
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

router.post('/association/photo/:idAssociation', isAuthentificated, (req, res) => {
  const idAssociation = req.params.idAssociation;
  const form = formidable.IncomingForm();
  const pathToFolder = path.join(__dirname, '..', 'public/images/uploads/');

  form.parse(req);

  form.on('fileBegin', (name, file) => {
    file.path = path.join(pathToFolder, file.name);
  });

  form.on('file', (name, file) => {
    Association.findById(idAssociation)
      .then(association => {
        association.logo = file.name;
        association.save();
      }).then(() => {
        res.redirect("/association/" + idAssociation);
      });
  });
});

module.exports = router;