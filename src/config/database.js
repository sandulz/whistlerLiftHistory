const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../database/lift_status.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  const migration = fs.readFileSync(
    path.join(__dirname, '../../database/migrations/init.sql'),
    'utf8'
  );
  
  db.exec(migration, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
    } else {
      console.log('Database initialized successfully');
    }
  });
}

module.exports = {
  db,
  initializeDatabase
}; 