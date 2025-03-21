# Whistler Lift History

A real-time tracking system for Whistler Blackcomb's lift operations and snowfall data. This application scrapes and stores historical lift status and snowfall information, presenting it in a weekly historical view.

See if it snowed and ops didn't crack a lift - get pow. 

## Features

- Real-time lift status tracking for Whistler and Blackcomb mountains
- Historical 7-day view of lift operations
- Daily snowfall tracking
- Automated data collection every 5 minutes for lift status
- Daily snowfall updates at 8 AM PST
- All times are stored and displayed in Pacific Time (PST/PDT)


## Tech Stack

- **Backend**: Node.js with Express
- **Database**: SQLite3
- **View Engine**: EJS
- **Task Scheduling**: node-cron
- **Web Scraping**: axios & cheerio
- **Process Management**: PM2
- **Web Server**: Nginx

## Prerequisites

- Node.js (v14 or higher)
- npm
- PM2 (for production deployment)
- Nginx (for production deployment)


## Project Structure

```
├── app.js                 # Application entry point
├── src/
│   ├── config/           # Configuration files
│   ├── models/           # Database models
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   └── views/            # EJS templates
├── database/
│   └── migrations/       # SQL migration files
├── public/              # Static files
└── config/
    └── nginx/           # Nginx configuration
```

## Security

The application includes several security measures:
- X-Frame-Options header
- X-XSS-Protection header
- X-Content-Type-Options header
- robots.txt to prevent indexing
- Rate limiting through Nginx

