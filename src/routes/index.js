const express = require('express');
const router = express.Router();
const LiftStatus = require('../models/liftStatus');
const Snowfall = require('../models/snowfall');

// Define the lift structure
const LIFT_STRUCTURE = {
  'Whistler Mountain': [
    'Peak Express',
    'Harmony 6 Express',
    'Symphony Express',
    'T-Bar'
  ],
  'Blackcomb Mountain': [
    'Glacier Express',
    '7th Heaven Express',
    'Showcase T-Bar'
  ],
  'Connection': [
    'PEAK 2 PEAK Gondola'
  ]
};

router.get('/', async (req, res) => {
  try {
    // Get lift status, snowfall data, and last update time
    const [weeklyStatus, weeklySnowfall, lastUpdateTime] = await Promise.all([
      LiftStatus.getWeeklyStatusWithCurrent(),
      Snowfall.getWeeklySnowfall(),
      LiftStatus.getLastUpdateTime()
    ]);
    
    // Filter status entries to only include our specified lifts
    const filteredStatus = weeklyStatus.filter(status => {
      return Object.values(LIFT_STRUCTURE).flat().includes(status.lift_name);
    });

    res.render('weeklyStatus', { 
      weeklyStatus: filteredStatus,
      weeklySnowfall: weeklySnowfall,
      liftStructure: LIFT_STRUCTURE,
      currentTime: lastUpdateTime
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

module.exports = router; 