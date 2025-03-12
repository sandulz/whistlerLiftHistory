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
                AND (LOWER(ls2.status) = 'open' OR ls2.status = '1')
              ) THEN 'Opened'
              ELSE 'Closed'
            END as status,
            CASE 
              WHEN EXISTS (
                SELECT 1 
                FROM lift_status ls2 
                WHERE ls2.lift_name = lift_status.lift_name 
                AND date(ls2.timestamp) = date(lift_status.timestamp)
                AND (LOWER(ls2.status) = 'open' OR ls2.status = '1')
              ) THEN (
                SELECT time(MIN(ls3.timestamp), 'localtime')
                FROM lift_status ls3
                WHERE ls3.lift_name = lift_status.lift_name 
                AND date(ls3.timestamp) = date(lift_status.timestamp)
                AND (LOWER(ls3.status) = 'open' OR ls3.status = '1')
              )
              ELSE NULL
            END as first_open_time
          FROM lift_status
          WHERE timestamp >= date('now', '-7 days')
          GROUP BY lift_name, date(timestamp)
        ),
        CurrentStatus AS (
          SELECT 
            lift_name, 
            CASE 
              WHEN status = '1' THEN 'Open'
              WHEN status = '0' THEN 'Closed'
              WHEN status = '2' THEN 'On Hold'
              WHEN status = '3' THEN 'Scheduled'
              WHEN status = '4' THEN 'Weather Hold'
              WHEN status = '5' THEN 'Maintenance Hold'
              WHEN status = '6' THEN 'Delayed'
              ELSE status  /* Keep original text if it's not a number */
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
          d.first_open_time,
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