const { db } = require('../config/database');

class LiftStatus {
  static async create(liftName, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO lift_status (lift_name, status) VALUES (?, ?)',
        [liftName, status],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  static async getWeeklyStatus() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          lift_name,
          date(timestamp) as date,
          GROUP_CONCAT(status) as daily_statuses
        FROM lift_status
        WHERE timestamp >= date('now', '-7 days')
        GROUP BY lift_name, date(timestamp)
        ORDER BY lift_name, date(timestamp) DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
}

module.exports = LiftStatus; 