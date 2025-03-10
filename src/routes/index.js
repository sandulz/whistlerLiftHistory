const express = require('express');
const router = express.Router();
const LiftStatus = require('../models/liftStatus');

router.get('/', async (req, res) => {
  try {
    const weeklyStatus = await LiftStatus.getWeeklyStatus();
    
    // Sort the status entries by mountain and lift name
    weeklyStatus.sort((a, b) => {
      // First sort by mountain (Whistler vs Blackcomb)
      const mountainA = a.lift_name.includes('Blackcomb') ? 'Blackcomb' : 'Whistler';
      const mountainB = b.lift_name.includes('Blackcomb') ? 'Blackcomb' : 'Whistler';
      
      if (mountainA !== mountainB) {
        return mountainA.localeCompare(mountainB);
      }
      
      // Then sort by lift name
      return a.lift_name.localeCompare(b.lift_name);
    });

    res.render('weeklyStatus', { 
      weeklyStatus,
      currentTime: new Date().toLocaleString()
    });
  } catch (error) {
    console.error('Error fetching lift status:', error);
    res.status(500).send('Error fetching lift status');
  }
});

module.exports = router; 