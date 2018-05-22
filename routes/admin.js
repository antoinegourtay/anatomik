const express = require('express'),
    router = express.Router();

router.get('/admin', (req, res) => {
    res.render('admin-home', {
        title: 'Anatomik - Admin'
    });
});

module.exports = router;