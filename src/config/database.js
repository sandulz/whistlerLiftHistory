const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../database/lift_status.db');
let db = null;

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

async function initializeDatabase() {
  if (db) {
    return db;
  }

  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      const migration = fs.readFileSync(
        path.join(__dirname, '../../database/migrations/init.sql'),
        'utf8'
      );
      
      // Set timezone to PST/PDT and ensure it's set each time
      db.serialize(() => {
        db.run(`PRAGMA timezone = 'America/Vancouver';`);
        db.run(`SELECT datetime('now', 'localtime');`); // Force timezone initialization
        db.exec(migration, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database initialized successfully');
            resolve(db);
          }
        });
      });
    });
  });
}

// Helper function to convert UTC to PST/PDT
function toPST(timestamp) {
  return `datetime(${timestamp}, 'America/Vancouver')`;
}

module.exports = {
  initializeDatabase,
  toPST
}; 