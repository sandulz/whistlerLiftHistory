const axios = require('axios');
const cheerio = require('cheerio');
const LiftStatus = require('../models/liftStatus');

async function scrapeLiftStatus() {
  try {
    const response = await axios.get(
      'https://www.whistlerblackcomb.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx'
    );
    
    // Find the JSON data in the page content
    const dataMatch = response.data.match(/\{"Name":"[^}]*"Mountain":"[^"]*Lifts"[^}]*\}/g);
    
    if (!dataMatch) {
      throw new Error('Could not find lift status data in page');
    }

    // Parse each lift status entry
    const lifts = dataMatch.map(item => {
      try {
        const liftData = JSON.parse(item);
        return {
          name: liftData.Name,
          status: liftData.Status,
          mountain: liftData.Mountain,
          openTime: liftData.OpenTime,
          closeTime: liftData.CloseTime,
          type: liftData.Type
        };
      } catch (err) {
        console.error('Error parsing lift data:', err);
        return null;
      }
    }).filter(lift => lift !== null);

    // Store each lift status in the database
    for (const lift of lifts) {
      try {
        await LiftStatus.create(lift.name, lift.status);
        console.log(`Updated status for ${lift.name}: ${lift.status}`);
      } catch (err) {
        console.error(`Error storing status for ${lift.name}:`, err);
      }
    }

    return lifts;
  } catch (error) {
    console.error('Error scraping lift status:', error);
    throw error;
  }
}

// Function to test the scraper
async function testScraper() {
  try {
    const lifts = await scrapeLiftStatus();
    console.log('Found lifts:', lifts.length);
    lifts.forEach(lift => {
      console.log(`${lift.name} (${lift.mountain}): ${lift.status}`);
    });
  } catch (error) {
    console.error('Test failed:', error);
  }
}

module.exports = {
  scrapeLiftStatus,
  testScraper
}; 