const axios = require('axios');
const cheerio = require('cheerio');
const LiftStatus = require('../models/liftStatus');
const Snowfall = require('../models/snowfall');
const { initializeDatabase } = require('../config/database');

async function scrapeLiftStatus() {
  const startTime = new Date();
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
      } catch (err) {
        console.error(`Error storing status for ${lift.name}:`, err);
      }
    }

    console.log(`Lift status update complete: ${lifts.length} lifts updated at ${startTime.toLocaleTimeString()}`);
    return lifts;
  } catch (error) {
    console.error('Error scraping lift status:', error);
    throw error;
  }
}

async function scrapeSnowfall() {
  try {
    const response = await axios.get(
      'https://www.whistlerblackcomb.com/the-mountain/mountain-conditions/snow-and-weather-report.aspx'
    );
    
    // Look for the FR.snowReportData structure
    const snowDataMatch = response.data.match(/FR\.snowReportData\s*=\s*({[\s\S]*?});/);
    
    if (!snowDataMatch) {
      throw new Error('Could not find snow report data in page');
    }

    try {
      const snowData = JSON.parse(snowDataMatch[1]);
      const snowfallCm = parseInt(snowData.TwentyFourHourSnowfall.Centimeters);
      
      if (isNaN(snowfallCm)) {
        throw new Error('Could not parse snowfall data');
      }

      await Snowfall.create(snowfallCm);
      console.log(`Snowfall update complete: ${snowfallCm}cm (Last updated: ${snowData.LastUpdatedText})`);
      
      return snowfallCm;
    } catch (parseError) {
      console.error('Error parsing snow data:', parseError);
      throw new Error('Could not parse snow report data');
    }
  } catch (error) {
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    }
    console.error('Error scraping snowfall:', error);
    throw error;
  }
}

// Function to test the scraper
async function testScraper() {
  try {
    await initializeDatabase();
    const lifts = await scrapeLiftStatus();
  } catch (error) {
    console.error('Initial scraper test failed:', error);
  }
}

module.exports = {
  scrapeLiftStatus,
  testScraper,
  scrapeSnowfall
}; 