import express from 'express';
import * as youtubeService from '../services/youtubeService.js';

const router = express.Router();

router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = await youtubeService.searchVideos(q || '');
    res.json(results);
  } catch (err) {
    next(err);
  }
});

export default router;
