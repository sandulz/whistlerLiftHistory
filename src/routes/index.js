const express = require('express');
const router = express.Router();
const LiftStatus = require('../models/liftStatus');

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
    'Horstman T-Bar',
    'Showcase T-Bar'
  ],
  'Connection': [
    'PEAK 2 PEAK Gondola'
  ]
};

router.get('/', async (req, res) => {
  try {
    const weeklyStatus = await LiftStatus.getWeeklyStatusWithCurrent();
    
    // Filter status entries to only include our specified lifts
    const filteredStatus = weeklyStatus.filter(status => {
      return Object.values(LIFT_STRUCTURE).flat().includes(status.lift_name);
    });

    res.render('weeklyStatus', { 
      weeklyStatus: filteredStatus,
      liftStructure: LIFT_STRUCTURE,
      currentTime: new Date().toLocaleString()
    });
  } catch (error) {
    console.error('Error fetching lift status:', error);
    res.status(500).send('Error fetching lift status');
  }
});

module.exports = router; 