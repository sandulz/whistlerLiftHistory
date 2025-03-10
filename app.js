const express = require('express');
const cron = require('node-cron');
const path = require('path');
const { initializeDatabase } = require('./src/config/database');
const { scrapeLiftStatus, testScraper } = require('./src/services/scraper');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Initialize database
initializeDatabase();

// Schedule lift status scraping at 0, 10, 20, 30, 40, 50 minutes of every hour
cron.schedule('0,10,20,30,40,50 * * * *', async () => {
  const now = new Date();
  console.log(`Starting scheduled scrape at ${now.toLocaleTimeString()}`);
  try {
    const lifts = await scrapeLiftStatus();
    console.log(`Successfully updated ${lifts.length} lift statuses at ${now.toLocaleTimeString()}`);
  } catch (error) {
    console.error('Error updating lift status:', error);
  }
});

// Initial test scrape on startup
testScraper().then(() => {
  console.log('Initial scraper test complete');
}).catch(err => {
  console.error('Initial scraper test failed:', err);
});

// Routes
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 