const mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose'),
    bcrypt = require('bcrypt-nodejs');

userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        maxlength: 50
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
    poste: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        trim: true
    },
    firstname: {
        type: String,
        trim: true
    },
    lastname: {
        type: String,
        trim: true
    },
    fullname: {
        type: String,
        trim: true,
    },
    telephone: {
        type: String,
        trim: true,
    },
    facebook: {
        type: String,
        trim: true
    },
    twitter: {
        type: String,
        trim: true,
    },
    linkedin: {
        type: String,
        trim: true,
    },
    instagram: {
        type: String,
        trim: true,
    },
    organizationType: {
        type: String,
        required: true,
        trim: true
    },
    photo_profil: {
        type: String,
    },
    description: {
        type: String,
        trim: true
    },
    competences: {
        type: Array,
        trim: true
    },
    association: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Association'
    },
    etablissement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Etablissement'
    },
    entreprise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entreprise'
    },
    is_archive: {
        type: Boolean,
    }
});

userSchema.virtual('user', {
    ref: 'Offer',
    localField: '_id',
    foreignField: 'user'
});

userSchema.virtual('user', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'associationResponsible'
});

userSchema.virtual('users', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'users'
});

// methods ======================
// generating a hash

userSchema.pre('save', function (next) {
    var user = this;
    var SALT_FACTOR = 5;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Users', userSchema);