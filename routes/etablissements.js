const express = require("express"),
  router = express.Router(),
  isAuthentificated = require("./utils/isAuthentificated"),
  Etablissement = require("./../models/Etablissement"),
  Association = require("./../models/Association"),
  User = require("./../models/users"),
  mongoose = require("mongoose");

router.get("/etablissements/show/:page?", isAuthentificated, (req, res, next) => {
  let user = usr;
  let perPage = 10
  let page = req.params.page || 1
  if (user.organizationType === "Anatomik") {
    Etablissement.find({
        is_archive: false
      })
      .populate('association')
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .sort({
        name: 1
      })
      .exec(function (err, etablissements) {
        Etablissement.count().exec(function (err, count) {
          res.render("etablissements/index", {
            title: 'Anatomik - Etablissements',
            etablissements: etablissements,
            user: user,
            current: page,
            pages: Math.ceil((count) / perPage)
          });
        });
      })
  } else if (user.organizationType === "Association" && user.role === "Admin") {
    Etablissement.find({
        association: user.association.id,
        is_archive: false
      })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .sort({
        name: 1
      })
      .exec(function (err, etablissements) {
        Etablissement.count().exec(function (err, count) {
          res.render("etablissements/index", {
            title: 'Anatomik - Etablissements',
            etablissements: etablissements,
            user: user,
            current: page,
            pages: Math.ceil((count) / perPage)
          });
        });
      })
  }
});

router.get("/etablissements/archives/:page?", isAuthentificated, (req, res, next) => {
  let user = usr;
  let perPage = 10
  let page = req.params.page || 1
  if (user.organizationType === "Anatomik") {
    Etablissement.find({
        is_archive: true
      })
      .populate('association')
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .sort({
        name: 1
      })
      .exec(function (err, etablissements) {
        Etablissement.count().exec(function (err, count) {
          res.render("etablissements/archives", {
            title: 'Anatomik - Archives établissement',
            etablissements: etablissements,
            user: user,
            current: page,
            pages: Math.ceil((count) / perPage)
          });
        });
      })
  } else if (user.organizationType === "Association" && user.role === "Admin") {
    Etablissement.find({
        association: user.association.id,
        is_archive: true
      })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .sort({
        name: 1
      })
      .exec(function (err, etablissements) {
        Etablissement.count().exec(function (err, count) {
          res.render("etablissements/archives", {
            title: 'Anatomik - Archives étalissement',
            etablissements: etablissements,
            user: user,
            current: page,
            pages: Math.ceil((count) / perPage)
          });
        });
      })
  }
});

router.get("/etablissement/new", isAuthentificated, (req, res, next) => {
  let user = usr;
  if (user.role == "Admin" && user.organizationType === "Association") {
    var etablissement = new Etablissement();
    res.render("etablissements/new", {
      title: 'Anatomik - Nouvel établissement',
      etablissement: etablissement,
      endpoint: "/etablissement",
      user: user
    });
  } else if (user.organizationType === "Anatomik") {
    Association.find({}).select({ id: 1, name: 1 }).then(associations => {
      var etablissement = new Etablissement();
      res.render("etablissements/new", {
        title: 'Anatomik - Nouvel établissement',
        etablissement: etablissement,
        associations: associations,
        endpoint: "/etablissement",
        user: user
      });
    })
  } else {
    res.render("index", {
      user: user
    });
  }
});

router.get('/etablissement/archive/:id', isAuthentificated, (req, res) => {
  let user = usr;
  if (user.role === "Admin" && user.organizationType === "Association" ||  user.organizationType === "Anatomik") {
    new Promise((resolve, reject) => {
        if (req.params.id) {
          Etablissement.findById(req.params.id).then(resolve, reject);
        } else {
          resolve(new Etablissement());
        }
      }).then(etablissement => {
        etablissement.is_archive = true
        etablissement.save(function (err) {
          if (err)
            console.log(err);
          return user;
        });
      })
      .then(() => {
        res.redirect("/");
      });
  } else {
    res.redirect('/')
  }
})

router.get("/etablissement/edit/:id", isAuthentificated, (req, res, next) => {
  let user = usr;
  if (user.role == "Admin" && user.organizationType === "Association") {
    Etablissement.findById(req.params.id)
      .populate("users")
      .then(
        etablissement => {
          User.find({
              etablissement: etablissement.id
            })
            .populate("etablissement")
            .then(users => {
              res.render("etablissements/edit", {
                title: 'Anatomik - Editer ' + etablissement.name,
                etablissement: etablissement,
                user: user,
                endpoint: "/etablissement/" + etablissement.id.toString()
              });
            });
        },
        err => res.status(500).send(err)
      );
  } else if (user.organizationType === "Anatomik") {
    Etablissement.findById(req.params.id)
      .populate("users")
      .populate("association")
      .then(
        etablissement => {
          User.find({
              etablissement: etablissement.id
            })
            .populate("etablissement")
            .then(users => {
              Association.find({}).then(associations => {
                res.render("etablissements/edit", {
                  title: 'Anatomik - Editer ' + etablissement.name,
                  etablissement: etablissement,
                  associations: associations,
                  user: user,
                  endpoint: "/etablissement/" + etablissement.id.toString()
                })
              });
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

router.get("/etablissement/:id", isAuthentificated, (req, res) => {
  let user = usr;
  Etablissement.findById(req.params.id)
    .populate("association")
    .populate("users")
    .then(etablissement => {
      if (etablissement.is_archive === true) {
        res.redirect('/');
      } else {
        let users = etablissement.users
        res.render("etablissements/show", {
          title: 'Anatomik - ' + etablissement.name,
          user: user,
          etablissement: etablissement,
          users: users
        });
      }
    });
});

router.post("/etablissement/:id?", isAuthentificated, (req, res) => {
  let user = usr;
  if (user.role == "Admin" && user.organizationType == "Association" ||  user.organizationType === "Anatomik") {
    new Promise((resolve, reject) => {
        if (req.params.id) {
          Etablissement.findById(req.params.id).then(resolve, reject);
        } else {
          resolve(new Etablissement());
        }
      })
      .then(etablissement => {
        etablissement.name = req.body.name;
        etablissement.adresse = req.body.adresse;
        etablissement.code_postal = req.body.code_postal;
        etablissement.complement_adresse = req.body.complement_adresse
        etablissement.ville = req.body.ville;
        etablissement.pays = req.body.pays;
        etablissement.telephone = req.body.telephone;
        etablissement.mail = req.body.mail;
        etablissement.type = req.body.type;

        if (user.organizationType === "Anatomik") {
          etablissement.association = req.body.association
        } else {
          etablissement.association = user.association.id;
        }
        etablissement.is_archive = req.body.is_archive


        return etablissement.save();
      })
      .then(() => {
        res.redirect("/");
      }, err => console.log(err));
  } else {
    res.render("/", {
      user: user
    });
  }
});

module.exports = router;