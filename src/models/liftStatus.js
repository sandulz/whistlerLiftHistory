const { db } = require('../config/database');

class LiftStatus {
  static async create(liftName, status) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO lift_status (lift_name, status, timestamp) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `;
      
      db.run(query, [liftName, status], function(err) {
        if (err) reject(err);
        resolve(this.lastID);
      });
    });
  }

  static async getWeeklyStatus() {
    return new Promise((resolve, reject) => {
      const query = `
        WITH DailyStatus AS (
          SELECT 
            lift_name,
            date(timestamp) as date,
            GROUP_CONCAT(status) as daily_statuses,
            MAX(CASE WHEN lower(status) = 'open' THEN 1 ELSE 0 END) as was_open
          FROM lift_status
          WHERE timestamp >= date('now', '-7 days')
          GROUP BY lift_name, date(timestamp)
        )
        SELECT 
          lift_name,
          date,
          CASE WHEN was_open = 1 THEN 'Opened' ELSE 'Closed' END as status
        FROM DailyStatus
        ORDER BY lift_name, date DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  static async getLatestStatus() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT DISTINCT lift_name, status
        FROM lift_status
        WHERE timestamp = (
          SELECT MAX(timestamp) FROM lift_status
        )
        ORDER BY lift_name
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
}

module.exports = LiftStatus; 