const mongoose = require('mongoose');

subphasesSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    value: {
        type: Number,
        require: true
    },
    state: {
        type: String,
        default: 'En cours'
    },
    phase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Phases'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    created_at: {
        type: Date,
        default: Date.now()
    }

});

subphasesSchema.virtual('phases', {
    ref: 'Phases',
    localField: "_id",
    foreignField: "phases"
});

module.exports = mongoose.model('Subphases', subphasesSchema);