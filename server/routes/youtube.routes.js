const express = require('express');
const router = express.Router();
const youtubeService = require('../services/youtubeService');

router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = await youtubeService.searchVideos(q || '');
    res.json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
