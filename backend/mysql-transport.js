const { Transport } = require('winston');
const mysql = require('mysql2/promise');

class MySQLTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.connection = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'coophelper'
    });
  }

  async log(info, callback) {
    setImmediate(() => this.emit('logged', info));

    // Skip logging for successful HTTP requests (status code 200 or 304)
    if (info.message && typeof info.message === 'string') {
      const statusMatch = info.message.match(/HTTP\/1\.1"\s+([0-9]{3})/);
      if (statusMatch && (statusMatch[1] === '200' || statusMatch[1] === '304')) {
        return callback();
      }
    }

    // // Ensure all log fields are defined, defaulting where necessary
    const { level, action = 'unknown_action', message, timestamp = new Date().toISOString(), ...details } = info;
    const detailsString = JSON.stringify(details);

    try {
      await this.connection.execute(
        'INSERT INTO activity_log (level, action, message, timestamp, details) VALUES (?, ?, ?, ?, ?)',
        [level, action, message, timestamp, detailsString]
      );
    } catch (error) {
      console.error('Error logging to MySQL:', error);
    }

    callback();
  }
}

module.exports = MySQLTransport;
