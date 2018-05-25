const express = require('express'),
  router = express.Router(),
  isAuthentificated = require('./utils/isAuthentificated'),
  path = require('path');

router.get('/download-file/:idProject/:filename', isAuthentificated, (req, res) => {
  const filePath = path.join(__dirname, '..', 'project-folders', req.params.idProject, req.params.filename);

  res.download(filePath);
});

router.get('/download-file/:idProject/:idPhase/:filename', isAuthentificated, (req, res) => {
  const filePath = path.join(__dirname, '..', 'project-folders', req.params.idProject, req.params.idPhase, req.params.filename);

  res.download(filePath);
});

module.exports = router;