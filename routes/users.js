const express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/users'),
    Association = require('../models/Association'),
    Entreprise = require('../models/Entreprise'),
    Offer = require('../models/Offer'),
    Service = require('../models/Offer'),
    fs = require('fs'),
    isAuthentificated = require("./utils/isAuthentificated"),
    Folder = require('../models/folder'),
    uuid = require('uuid/v4'),
    bcrypt = require('bcrypt-nodejs'),
    flash = require('connect-flash'),
    async = require('async'),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    path = require('path'),
    formidable = require('formidable');

// route to register page
router.get('/signup', isAuthentificated, (req, res) => {
    let user = usr;
    if (user.organizationType === "Anatomik") {
        Association.find({}).select({ id: 1, name: 1 }).then(associations => {
            Entreprise.find({}).select({ id: 1, name: 1 }).then(entreprises => {
                console.log(associations)
                res.render('users/signup', {
                    title: 'Anatomik - Inscription',
                    user: user,
                    associations: associations,
                    entreprises: entreprises
                });
            })
        });
    } else if (user.organizationType === "Association") {
        Association.findById(user.association).populate('etablissements').then(association => {
            let etablissements = association.etablissements;
            res.render('users/signup', {
                title: 'Anatomik - Inscription',
                user: user,
                association: association,
                etablissements: etablissements
            });
        })
    } else if (user.organizationType === "Entreprise") {
        Entreprise.findById(user.entreprise).then(entreprise => {
            res.render('users/signup', {
                title: 'Anatomik - Inscription',
                user: user,
                entreprise: entreprise
            });
        });
    }
});

// route for register action
router.post('/signup', isAuthentificated, (req, res) => {
    let user = usr;
    let organizationType = null;
    let association = null;
    let entreprise = null;
    if (req.body.organizationType == undefined) {
        organizationType = user.organizationType;
    } else {
        organizationType = req.body.organizationType;
    }
    if (req.body.association == undefined) {
        association = user.association;
    } else {
        association = req.body.association;
    }
    if (req.body.entreprise == undefined) {
        entreprise = user.entreprise;
    } else {
        entreprise = req.body.entreprise;
    }
    User.register(new User({
        email: req.body.email,
        username: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
        fullname: req.body.lastname + ' ' + req.body.firstname,
        poste: req.body.poste,
        organizationType: organizationType,
        association: association,
        role: req.body.role,
        etablissement: req.body.etablissement,
        entreprise: entreprise,
        is_archive: false,

    }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render('users/signup', {
                user: user,
            });
        } else {}
    });
    res.redirect('/');
});

// route to login page
router.get('/login', (req, res) => {
    res.render('users/login', {
        title: 'Anatomik - Login',
        user: req.user,
    });
});
// route for login action
router.post('/login', (req, res) => {
    passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login',
    })(req, res, function () {});
});

router.get('/forgot', (req, res) => {
    res.render('users/forgot', {
        title: 'Anatomik - Mot de passe oublié',
        user: req.user
    });
});

router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({
                email: req.body.email
            }, function (err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
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
                to: user.email,
                from: 'contact@anatomik.eu',
                subject: 'Demande de changement de mot de passe Anatomik',
                text: 'Vous recevez ce mail car vous avez cliquez sur mot de passe oublié.\n\n' +
                    'Cliquer sur le lien suivant pour être rediriger vers la page de changement de mot de passe:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    "Si vous n'avez pas fait la demande, ignorez cet email.\n"
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function (req, res) {
    User.find({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (!user) {
            console.log(err)
            console.log('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('users/reset', {
            title: 'Anatomik - Changer mot de passe',
            user: req.user
        });
    });
});

router.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function (err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }

                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function (err) {
                    req.logIn(user, function (err) {
                        done(err, user);
                    });
                });
            });
        },
        function (user, done) {
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
                to: user.email,
                from: 'contact@anatomik.eu',
                subject: 'Votre mot de passe a été changé.',
                text: 'Hello,\n\n' +
                    'Le mot de passe de ' + user.email + ' a bien été changé.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/');
    });
});

router.get('/users/show/:page?', isAuthentificated, (req, res) => {
    let user = usr
    let perPage = 20
    let page = req.params.page || 1
    if (user.organizationType === "Anatomik") {
        User.find({
                is_archive: false
            })
            .populate('association')
            .populate('entreprise')
            .select({ id: 1, firstname: 1, lastname: 1, fullname: 1, organizationType: 1, poste: 1 })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .sort({
                organizationType: 1,
                lastname: 1
            })
            .exec(function (err, list_users) {
                User.count().exec(function (err, count) {
                    res.render('users/all', {
                        title: 'Anatomik - Utilisateurs',
                        users: list_users,
                        user: user,
                        current: page,
                        pages: Math.ceil((count) / perPage)
                    });
                });
            });
    } else if (user.organizationType === "Association" && user.role === "Admin") {
        User.find({
                association: user.association.id,
                is_archive: false
            })
            .select({ id: 1, firstname: 1, lastname: 1, fullname: 1, organizationType: 1, poste: 1 })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .sort({
                organizationType: 1,
                lastname: 1
            })
            .exec(function (err, list_users) {
                User.count().exec(function (err, count) {
                    res.render('users/all', {
                        title: 'Anatomik - Utilisateurs',
                        users: list_users,
                        user: user,
                        current: page,
                        pages: Math.ceil((count) / perPage)
                    })
                })
            })
    } else if (user.organizationType === 'Entreprise' && user.role === "Admin") {
        User.find({
                entreprise: user.entreprise.id,
                is_archive: false
            })
            .select({ id: 1, firstname: 1, lastname: 1, fullname: 1, organizationType: 1, poste: 1 })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .sort({
                organizationType: 1,
                lastname: 1
            })
            .exec(function (err, list_users) {
                User.count().exec(function (err, count) {
                    res.render('users/all', {
                        title: 'Anatomik - Utilisateurs',
                        users: list_users,
                        user: user,
                        current: page,
                        pages: Math.ceil((count) / perPage)
                    })
                })
            })
    } else {
        res.render('index', {
            title: 'Anatomik - Dashboard',
            user: user
        });
    }
});
router.get('/users/archives/:page?', isAuthentificated, (req, res) => {
    let user = usr
    let perPage = 20
    let page = req.params.page || 1
    if (user.organizationType === "Anatomik") {
        User.find({
                is_archive: true
            })
            .populate('association')
            .populate('entreprise')
            .select({ id: 1, firstname: 1, lastname: 1, fullname: 1, organizationType: 1, poste: 1 })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .sort({
                organizationType: 1,
                lastname: 1
            })
            .exec(function (err, list_users) {
                User.count().exec(function (err, count) {
                    res.render('users/all_archive', {
                        title: 'Anatomik - Utilisateurs',
                        users: list_users,
                        user: user,
                        current: page,
                        pages: Math.ceil((count) / perPage)
                    })
                })
            })
    } else if (user.organizationType === "Association" && user.role === "Admin") {
        User.find({
                association: user.association.id,
                is_archive: true
            })
            .select({ id: 1, firstname: 1, lastname: 1, fullname: 1, organizationType: 1, poste: 1 })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .sort({
                organizationType: 1,
                lastname: 1
            })
            .exec(function (err, list_users) {
                User.count().exec(function (err, count) {
                    res.render('users/all_archive', {
                        title: 'Anatomik - Utilisateurs',
                        users: list_users,
                        user: user,
                        current: page,
                        pages: Math.ceil((count) / perPage)
                    })
                })
            })
    } else if (user.organizationType === 'Entreprise' && user.role === "Admin") {
        User.find({
                entreprise: user.entreprise.id,
                is_archive: true
            })
            .select({ id: 1, firstname: 1, lastname: 1, fullname: 1, organizationType: 1, poste: 1 })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .sort({
                organizationType: 1,
                lastname: 1
            })
            .exec(function (err, list_users) {
                User.count().exec(function (err, count) {
                    res.render('users/all_archive', {
                        title: 'Anatomik - Utilisateurs',
                        users: list_users,
                        user: user,
                        current: page,
                        pages: Math.ceil((count) / perPage)
                    });
                });
            });
    } else {
        res.render('index', {
            user: user
        });
    }
});


router.get('/users/delete/:id', isAuthentificated, (req, res) => {
    let user = usr;
    if (user.role === "Admin") {
        new Promise((resolve, reject) => {
                if (req.params.id) {
                    User.findById(req.params.id).then(resolve, reject);
                } else {
                    resolve(new User());
                }
            }).then(user => {
                user.is_archive = true
                user.save(function (err) {
                    if (err)
                        console.log(err);
                    return user;
                });
            })
            .then(() => {
                res.redirect("/users/show/1");
            });
    } else {
        res.redirect('/')
    }
})
router.get('/users/restore/:id', isAuthentificated, (req, res) => {
    let user = usr;
    if (user.role === "Admin") {
        new Promise((resolve, reject) => {
                if (req.params.id) {
                    User.findById(req.params.id).then(resolve, reject);
                } else {
                    resolve(new User());
                }
            }).then(user => {
                user.is_archive = false
                user.save(function (err) {
                    if (err)
                        console.log(err);
                    return user;
                });
            })
            .then(() => {
                res.redirect("/users/show");
            });
    } else {
        res.redirect('/');
    }
});


router.get('/profile/edit/:id', isAuthentificated, (req, res) => {
    let user = usr
    User.findById(req.params.id).populate('association').populate('etablissement').populate('entreprise').then(user_profile => {
        if (user_profile.organizationType === "Association" && user.organizationType == "Association" && user.role === "Admin") {
            Association.findById(user_profile.association).populate('etablissements').then(association => {
                let etablissements = association.etablissements;
                res.render('users/edit', {
                    title: 'Anatomik - Editer profil',
                    user: user,
                    user_profile: user_profile,
                    etablissements: etablissements
                });
            })
        } else if (user.organizationType === 'Anatomik' ||  user.id === user_profile.id) {

            res.render('users/edit-noasso', {
                title: 'Anatomik - Editer profil',
                user: user,
                user_profile: user_profile,
            });
        } else if (user_profile.organizationType === "Entreprise" && user.organizationType === "Entreprise" && user.role === "Admin") {
            res.render('users/edit-noasso', {
                title: 'Anatomik - Editer profil',
                user: user,
                user_profile: user_profile,
            });
        } else {
            res.redirect('/');
        }
    });
});


router.get('/profile/:id', isAuthentificated, (req, res) => {
    let user = usr
    User.findById(req.params.id).populate('association').populate('etablissement').populate('entreprise').then(user_profile => {
        if (user_profile.is_archive === false) {
            res.render('users/profile', {
                title: 'Anatomik - Profil',
                user_profile: user_profile,
                user: user
            });
        } else {
            res.redirect('/');
        }
    })
});

router.post("/profile/:id?", isAuthentificated, (req, res) => {
    let active_user = usr;

    new Promise((resolve, reject) => {
            if (req.params.id) {
                User.findById(req.params.id).then(resolve, reject);
            } else {
                resolve(new User());
            }
        })
        .then(user => {
            console.log(req.body)
            user.email = req.body.email
            user.username = req.body.email
            user.firstname = req.body.firstname
            user.lastname = req.body.lastname
            user.fullname = user.lastname + ' ' + user.firstname
            if (req.body.password != '' && req.body.confirmPassword != '' && req.body.password === req.body.confirmPassword) {
                user.password = req.body.password
            }
            user.poste = req.body.poste
            user.telephone = req.body.telephone
            user.facebook = req.body.facebook
            user.twitter = req.body.twitter
            user.linkedin = req.body.linkedin
            user.instagram = req.body.instagram
            user.description = req.body.description
            user.etablissement = req.body.etablissement
            if (req.body.competences) {
                competences = req.body.competences.split(",")
                user.competences = competences
            }
            user.is_archive = false

            user.save(function (err) {
                if (err)
                    console.log(err);
                return user;
            });
        })
        .then(() => {
            res.redirect("/profile/"+req.params.id);
        });
});

router.post('/profile/photo/:idUser', isAuthentificated, (req, res) => {
    const idUser = req.params.idUser;
    let form = formidable.IncomingForm();
    const pathToFolder = path.join(__dirname, '..', 'public', 'images', 'uploads');

    form.parse(req);

    form.on('fileBegin', (name, file) => {
        file.path = path.join(pathToFolder, file.name);
    });

    form.on('file', (name, file) => {
        User.findById(idUser)
            .populate('users')
            .then(user => {
                user.photo_profil = file.name;
                user.save();
            }).then(() => {
                res.redirect("/profile/" + idUser);
            });
    });

});

// route for logout action
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;