const { initializeDatabase } = require('../src/config/database');
const sqlite3 = require('sqlite3').verbose();

async function showDatabaseContents() {
  await initializeDatabase();
  const db = new sqlite3.Database('./database/lift_status.db');

  // Show snowfall entries
  console.log('\n=== LAST 7 DAYS SNOWFALL ENTRIES ===');
  db.all(`
    SELECT 
      snowfall_cm,
      datetime(timestamp, 'localtime') as local_time
    FROM daily_snowfall
    WHERE timestamp >= date('now', '-7 days')
    ORDER BY timestamp DESC
  `, [], (err, rows) => {
    if (err) {
      console.error('Error querying daily_snowfall:', err);
      return;
    }
    console.table(rows);

    // Show latest lift status entries
    console.log('\n=== LATEST LIFT STATUS ===');
    db.all(`
      SELECT 
        lift_name,
        status,
        datetime(timestamp, 'localtime') as local_time
      FROM lift_status
      WHERE timestamp = (
        SELECT MAX(timestamp) FROM lift_status
      )
      ORDER BY lift_name
    `, [], (err, rows) => {
      if (err) {
        console.error('Error querying lift_status:', err);
        return;
      }
      console.table(rows);
      db.close();
    });
  });
}

showDatabaseContents(); 