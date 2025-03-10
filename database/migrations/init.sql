CREATE TABLE IF NOT EXISTS lift_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lift_name TEXT NOT NULL,
  status TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lift_status_timestamp 
ON lift_status(timestamp); 