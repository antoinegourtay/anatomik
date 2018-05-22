const express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    path = require('path'),
    Promise = require('promise');

router.get('/archive', (req, res) => {
    res.render('archive', {
        title: 'Anatomik - Archive',
        user: req.user
    });
});

router.get('/archive/:id_folder', (req, res) => {
    let idFolder = req.params.id_folder;

    res.render('archive-folder', {
        title: 'Anatomik - Archive',
        user: req.user
    });
});

module.exports = router;