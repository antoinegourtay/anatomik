const mongoose = require('mongoose');

documentSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    phase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Phases'
    }
});

module.exports = mongoose.model('Documents', documentSchema);