module.exports = {
  apps: [{
    name: 'whistler-status',
    script: 'app.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      TZ: 'America/Vancouver'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}; 