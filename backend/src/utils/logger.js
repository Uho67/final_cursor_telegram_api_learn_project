const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.logFile = path.join(this.logDir, 'telegram.log');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Log initialization
    console.log('\n' + '='.repeat(50));
    console.log('\x1b[33m[Logger] Initialized\x1b[0m');
    console.log('Log directory:', this.logDir);
    console.log('Log file:', this.logFile);
    console.log('='.repeat(50) + '\n');
  }

  log(type, data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type,
      data
    };

    // Log to console with colors and formatting
    const colors = {
      MESSAGE: '\x1b[32m', // Green
      UPDATE: '\x1b[36m',  // Cyan
      ERROR: '\x1b[31m',   // Red
      INFO: '\x1b[33m',    // Yellow
      WARN: '\x1b[35m',    // Magenta
      RESET: '\x1b[0m'     // Reset
    };

    const color = colors[type] || colors.INFO;
    console.log('\n' + '='.repeat(50));
    console.log(`${color}[${timestamp}] ${type}:${colors.RESET}`);
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(50) + '\n');

    // Log to file
    try {
      fs.appendFileSync(
        this.logFile,
        JSON.stringify(logEntry, null, 2) + '\n',
        'utf8'
      );
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  message(message) {
    this.log('MESSAGE', message);
  }

  update(update) {
    this.log('UPDATE', update);
  }

  error(error) {
    this.log('ERROR', {
      message: error.message,
      stack: error.stack
    });
  }

  info(data) {
    this.log('INFO', data);
  }

  warn(data) {
    this.log('WARN', data);
  }
}

module.exports = new Logger(); 