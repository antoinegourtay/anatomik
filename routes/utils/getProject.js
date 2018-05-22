const mongoose = require('mongoose'),
    Promise = require('promise'),
    Project = require('../../models/project');

module.exports = (projectId) => {
    return new Promise((success, failure) => {
        Project.findById(projectId)
            .populate("projects")
            .then((project, err) => {
                if (err)
                    failure(err);
                else
                    success(project);
            });
    });
};