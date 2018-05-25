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
        $or: [{
          fullname: new RegExp(query, "i"),
        },
      ],
      is_archive: false
    }).populate({path: 'association',select: '_id name'}).populate({path: 'entreprise',select: '_id name'})
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
        }).select({ id: 1, name: 1, logo: 1 })
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
            .select({ id: 1, name: 1, logo: 1 })
            .populate({path: 'association',select: '_id name'})
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
                .select({ id: 1, name: 1, logo: 1 })
                .then(entreprises => {
                  Project.find({
                      name: new RegExp(query, "i"),
                      isArchived: false,
                      $or: [{
                        associationResponsible: active_user.id
                      },
                      {
                          users: active_user.id
                      },
                        ]
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