const mongoose = require('mongoose');

projectSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        require: true
    },
    uuid: {
        type: String,
        require: true,
    },
    objective: {
        type: String,
    },
    state: {
        type: String,
        require: true,
    },
    description: {
        type: String,
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    startDate: {
        type: String,
        require: true
    },
    endDate: {
        type: String,
        require: true
    },
    associationResponsible: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    users: {
        type: Array,
        ref: 'Users'
    },
    isArchived: {
        type: Boolean,
        default: false
    }
});

projectSchema.virtual('phases', {
    ref: "Phases",
    localField: "_id",
    foreignField: "project"

});

projectSchema.virtual('subphases', {
    ref: 'Subphases',
    localField: '_id',
    foreignField: 'project'

})

module.exports = mongoose.model('Project', projectSchema);