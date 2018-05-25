const mongoose = require('mongoose');

phasesSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String
    },
    uuid: {
        type: String,
    },
    startDatePhase: {
        type: String,
        require: true
    },
    endDatePhase: {
        type: String,
        require: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    entreprise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entreprise'
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
});

phasesSchema.virtual('subphases', {
    ref: "Subphases",
    localField: "_id",
    foreignField: "phase"
});

phasesSchema.virtual('documents', {
    ref: "Documents",
    localField: "_id",
    foreignField: "phase"
});

module.exports = mongoose.model('Phases', phasesSchema);