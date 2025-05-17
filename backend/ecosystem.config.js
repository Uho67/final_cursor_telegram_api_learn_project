module.exports = {
    apps: [{
      name: "telegram-user-bot-backend",
      script: "./src/app.js",
      watch: true,
      env: {
        "NODE_ENV": "production",
        "PORT": 3002
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true
    }]
  };