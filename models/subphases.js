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
        required: true
    },
    phase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Phases'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }

});

subphasesSchema.virtual('phases', {
    ref: 'Phases',
    localField: "_id",
    foreignField: "phases"
});

module.exports = mongoose.model('Subphases', subphasesSchema);