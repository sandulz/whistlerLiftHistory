const express = require('express');
const cron = require('node-cron');
const path = require('path');
const { initializeDatabase } = require('./src/config/database');
const { scrapeLiftStatus, testScraper, scrapeSnowfall } = require('./src/services/scraper');
const routes = require('./src/routes');

const app = express();

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database and server initialized on port ' + (process.env.PORT || 3000));
    
    // View engine setup
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'src/views'));

    // Schedule lift status scraping every 10 minutes
    cron.schedule('0,10,20,30,40,50 * * * *', async () => {
      const now = new Date();
      console.log(`Starting scheduled lift scrape at ${now.toLocaleTimeString()}`);
      try {
        const lifts = await scrapeLiftStatus();
        console.log(`Successfully updated ${lifts.length} lift statuses at ${now.toLocaleTimeString()}`);
      } catch (error) {
        console.error('Error updating lift status:', error);
      }
    });

    // Schedule snowfall scraping at 8am PST daily
    cron.schedule('0 8 * * *', async () => {
      const now = new Date();
      console.log(`Starting scheduled snowfall scrape at ${now.toLocaleTimeString()}`);
      try {
        await scrapeSnowfall();
      } catch (error) {
        console.error('Error updating snowfall:', error);
      }
    }, {
      timezone: "America/Vancouver"
    });

    // Initial data collection
    await Promise.all([
      testScraper(),
      scrapeSnowfall()
    ]);

    // Routes
    app.use('/', routes);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer(); 