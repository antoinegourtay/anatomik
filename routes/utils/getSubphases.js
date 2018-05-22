const mongoose = require('mongoose'),
    Promise = require('promise'),
    Subphase = require('../../models/subphases');

module.exports = (subphaseId) => {
    return new Promise((success, failure) => {
        Subphase.findById(subphaseId)
            .populate("subpahses")
            .then((subphase, err) => {
                if (err)
                    failure(err);
                else
                    success(subphase);
            });
    });
};