const mongoose = require('mongoose');

folderSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        require: true
    },
    uid: {
        type: String,
        require: true
    },
    is_root: {
        type: Boolean,
        require: true
    },
    parent_folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder'
    }
});

folderSchema.virtual('documents', {
    ref: 'Document',
    localField: '_id',
    foreignField: 'containing_folder'
});

module.exports = mongoose.model('Folder', folderSchema);