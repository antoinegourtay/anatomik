const mongoose = require('mongoose'),
    Promise = require('promise'),
    Phase = require('../../models/phases');

module.exports = (phaseId) => {
    return new Promise((success, failure) => {
        Phase.findById(phaseId)
            .populate("phases")
            .then((phase, err) => {
                if (err)
                    failure(err);
                else
                    success(phase);
            });
    });
};