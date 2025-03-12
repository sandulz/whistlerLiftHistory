const { db } = require('../config/database');

class Snowfall {
  static async create(snowfallCm) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO daily_snowfall (snowfall_cm) 
        VALUES (?)
      `;
      
      db.run(query, [snowfallCm], function(err) {
        if (err) reject(err);
        resolve(this.lastID);
      });
    });
  }

  static async getWeeklySnowfall() {
    return new Promise((resolve, reject) => {
      const query = `
        WITH LatestDailySnowfall AS (
          SELECT 
            snowfall_cm,
            date(timestamp) as date,
            ROW_NUMBER() OVER (PARTITION BY date(timestamp) ORDER BY timestamp DESC) as rn
          FROM daily_snowfall
          WHERE date(timestamp) >= date('now', '-7 days')
        )
        SELECT 
          snowfall_cm,
          date
        FROM LatestDailySnowfall
        WHERE rn = 1
        ORDER BY date DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
}

module.exports = Snowfall; 