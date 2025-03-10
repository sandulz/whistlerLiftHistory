const express = require('express');
const router = express.Router();
const LiftStatus = require('../models/liftStatus');

router.get('/', async (req, res) => {
  try {
    const weeklyStatus = await LiftStatus.getWeeklyStatus();
    res.render('weeklyStatus', { weeklyStatus });
  } catch (error) {
    res.status(500).send('Error fetching lift status');
  }
});

module.exports = router; 