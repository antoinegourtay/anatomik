const express = require("express"),
  router = express.Router(),
  isAuthentificated = require("./utils/isAuthentificated"),
  mongoose = require('mongoose'),
  Association = require("./../models/Association"),
  User = require("./../models/users"),
  Etablissement = require("./../models/Etablissement"),
  Entreprise = require("./../models/Entreprise"),
  Project = require("./../models/project");


router.get('/search?:id', isAuthentificated, (req, res) => {
  let active_user = usr
  let query = req.query['search']
  User.find({
      fullname: new RegExp(query, "i"),
      is_archive: false
    })
    .then(users => {
      Association.find({
          is_archive: false,
          $or: [{
              name: new RegExp(query, "i")
            },
            {
              ville: new RegExp(query, "i")
            },
            {
              code_postal: new RegExp(query, "i")
            },
          ]
        })
        .then(associations => {
          Etablissement.find({
              is_archive: false,
              $or: [{
                  name: new RegExp(query, "i")
                },
                {
                  ville: new RegExp(query, "i")
                },
                {
                  code_postal: new RegExp(query, "i")
                },
              ]
            })
            .populate('association')
            .then(etablissements => {
              Entreprise.find({
                  is_archive: false,
                  $or: [{
                      name: new RegExp(query, "i")
                    },
                    {
                      ville: new RegExp(query, "i")
                    },
                    {
                      code_postal: new RegExp(query, "i")
                    },
                  ]
                })
                .then(entreprises => {
                  Project.find({
                      name: new RegExp(query, "i")
                    })
                    .then(projets => {
                      res.render("search/index", {
                        title: 'Anatomik - ' + query,
                        user: active_user,
                        associations: associations,
                        etablissements: etablissements,
                        entreprises: entreprises,
                        projets: projets,
                        users: users,
                        query: query
                      });
                    });
                });
            });
        });
    });
});
module.exports = router;