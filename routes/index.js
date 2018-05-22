const express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  isAuthentificated = require("./utils/isAuthentificated"),
  User = mongoose.model('Users');



router.get('/', (req, res) => {
  if (req.user) {
    let user = req.user;
    User.findById(user.id).populate('entreprise').populate('association').populate('etablissement').then(user => {
      res.render('index', {
        title: 'Anatomik - Dashboard',
        user: user,
      });
    });
  } else {
    res.render('index', {
      title: 'Anatomik',
      user: null,
    });
  }
});

router.get('/coming_soon', isAuthentificated, (req, res) => {
  let user = usr;
  res.render('comingSoon', {
    title: 'Anatomik - Bientôt disponible',
    user: user
  });
});

router.get('/mentions_legales', isAuthentificated, (req, res) => {
  let user = usr
  res.render('mentions_legales', {
    title: 'Anatomik - Mentions légales',
    user: user
  })
})
// router.use(function(req, res) {
//   res.status(400);
//   res.render('404')
// });
/**
 * Importing other routes
 */

const users = require('./users'),
  offers = require('./offers'),
  associations = require('./associations'),
  services = require('./services'),
  etablissements = require('./etablissements'),
  search = require('./search'),
  entreprises = require('./entreprises'),
  projectManagament = require('./project-management'),
  admin = require('./admin'),
  archive = require('./archive'),
  download = require('./download');

router.use(users);
router.use(offers);
router.use(associations);
router.use(services);
router.use(etablissements);
router.use(search);
router.use(entreprises);
router.use(projectManagament);
router.use(admin);
router.use(archive);
router.use(download);

module.exports = router;