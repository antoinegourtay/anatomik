var User = require("./../../models/users");

module.exports = (req, res, next) => {
    if (!req.user) {
        // res.redirect('/logout');
        res.redirect('/login');
    } else {
        const user = req.user;
        User.findById(user.id).populate('association').populate('etablissement').populate('entreprise').then(user => {
            usr = user;
            next();
        });
    }
};