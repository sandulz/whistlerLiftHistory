const axios = require('axios');
const cheerio = require('cheerio');
const LiftStatus = require('../models/liftStatus');

async function scrapeLiftStatus() {
  try {
    const response = await axios.get(
      'https://www.whistlerblackcomb.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx'
    );
    
    const $ = cheerio.load(response.data);
    
    // Note: You'll need to adjust these selectors based on the actual HTML structure
    $('.lift-status-item').each(async (_, element) => {
      const liftName = $(element).find('.lift-name').text().trim();
      const status = $(element).find('.status').text().trim();
      
      await LiftStatus.create(liftName, status);
    });
  } catch (error) {
    console.error('Error scraping lift status:', error);
    throw error;
  }
}

module.exports = {
  scrapeLiftStatus
}; 