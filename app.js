const express = require('express');
const cron = require('node-cron');
const path = require('path');
const { initializeDatabase } = require('./src/config/database');
const { scrapeLiftStatus } = require('./src/services/scraper');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Initialize database
initializeDatabase();

// Schedule lift status scraping every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  try {
    await scrapeLiftStatus();
    console.log('Lift status updated successfully');
  } catch (error) {
    console.error('Error updating lift status:', error);
  }
});

// Routes
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 