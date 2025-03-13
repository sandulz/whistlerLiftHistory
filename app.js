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
    
    // Add trust proxy setting for running behind Nginx
    app.set('trust proxy', 1);
    
    // View engine setup
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'src/views'));

    // Add some basic security middleware
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });

    // Schedule lift status scraping every 5 minutes (at X:00, X:05, X:10, etc.)
    cron.schedule('*/5 * * * *', async () => {
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

    // Use port 3000 for production
    const port = process.env.NODE_ENV === 'production' ? 3000 : (process.env.PORT || 3000);
    const host = process.env.NODE_ENV === 'production' ? '127.0.0.1' : 'localhost';
    
    app.listen(port, host, () => {
      console.log(`Server is running on ${host}:${port} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer(); 