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
            CASE 
              WHEN EXISTS (
                SELECT 1 
                FROM lift_status ls2 
                WHERE ls2.lift_name = lift_status.lift_name 
                AND date(ls2.timestamp) = date(lift_status.timestamp)
                AND LOWER(ls2.status) = 'open'
              ) THEN 'Opened'
              ELSE 'Closed'
            END as status
          FROM lift_status
          WHERE timestamp >= date('now', '-7 days')
          GROUP BY lift_name, date(timestamp)
        )
        SELECT 
          lift_name,
          date,
          status
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

  static async getWeeklyStatusWithCurrent() {
    return new Promise((resolve, reject) => {
      const query = `
        WITH DailyStatus AS (
          SELECT 
            lift_name,
            date(timestamp) as date,
            CASE 
              WHEN EXISTS (
                SELECT 1 
                FROM lift_status ls2 
                WHERE ls2.lift_name = lift_status.lift_name 
                AND date(ls2.timestamp) = date(lift_status.timestamp)
                AND LOWER(ls2.status) = 'open'
              ) THEN 'Opened'
              ELSE 'Closed'
            END as status
          FROM lift_status
          WHERE timestamp >= date('now', '-7 days')
          GROUP BY lift_name, date(timestamp)
        ),
        CurrentStatus AS (
          SELECT 
            lift_name, 
            CASE 
              WHEN LOWER(status) = 'open' THEN 'Open'
              WHEN LOWER(status) = '1' THEN 'Open'
              WHEN LOWER(status) = '0' THEN 'Closed'
              ELSE 'Closed'
            END as current_status
          FROM lift_status
          WHERE timestamp = (
            SELECT MAX(timestamp) FROM lift_status
          )
        )
        SELECT 
          d.lift_name,
          d.date,
          d.status,
          c.current_status
        FROM DailyStatus d
        LEFT JOIN CurrentStatus c ON d.lift_name = c.lift_name
        ORDER BY d.lift_name, d.date DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
}

module.exports = LiftStatus; 