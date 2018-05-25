const express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  isAuthentificated = require("./utils/isAuthentificated"),
  nodemailer = require('nodemailer'),
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

router.get('/cgu', (req, res) => {
  if (!req.user) {
    res.render('cgu_noco', {
      title: 'Anatomik - CGV',
      user: ""
    })
} else {
    const user = req.user;
    User.findById(user.id).populate('association').populate('etablissement').populate('entreprise').then(user => {
        usr = user;
        res.render('cgu', {
          title: 'Anatomik - CGV',
          user: user
        })
    });
}

})

router.get('/mentions_legales', isAuthentificated, (req, res) => {
  let user = usr
  res.render('mentions_legales', {
    title: 'Anatomik - Mentions légales',
    user: user
  })
})

router.get('/contact', isAuthentificated, (req, res) => {
  let user = usr
  res.render('contact', {
    title: 'Anatomik - Mentions légales',
    user: user
  })
})

router.post('/contact', function (req, res) {
  var smtpTransport = nodemailer.createTransport({
      host: 'send.one.com',
      port: 465,
      secure: true, // use SSL
      auth: {
          user: 'contact@anatomik.eu',
          pass: 'spad2306'
      }
  });
  var mailOptions = {
      to: "contact@anatomik.eu",
      from: "contact@anatomik.eu",
      subject: 'Formulaire de contact',
      text: 'De : '+req.body.email+'\nSujet : '+req.body.subject+'\n'+req.body.message
  };
  smtpTransport.sendMail(mailOptions, function (err) {
      if(err){
        console.log(err);
      }else{
        res.redirect('/')
      }
  });
});


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
