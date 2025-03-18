require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const winston = require('winston');
const XLSX = require('xlsx');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const CryptoJS = require('crypto-js');
const MySQLTransport = require('./mysql-transport'); // Adjust the path as necessary

// Function to hash password
const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

// Function to generate temporary password
const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8); // generates 8 character random string
};
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const moment = require('moment-timezone');

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  // Send initial connection message
  ws.send(JSON.stringify({ type: 'connection', message: 'Connected to server' }));

  // Handle incoming messages
  ws.on('message', (message) => {
    console.log('Received:', message);
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Send heartbeat every 30 seconds to keep connection alive
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'heartbeat', timestamp: new Date().getTime() }));
    }
  }, 30000);

  // Clear interval when connection closes
  ws.on('close', () => {
    clearInterval(interval);
  });
});

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure CORS with specific options for cookies
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add cookie parser middleware
app.use(cookieParser());

app.use(fileUpload());
app.use('/files', express.static(uploadDir));
app.use(express.json());


// Proxy endpoints for Thai address API
app.get('/api/thailand/provinces', async (req, res) => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json');
    const provinces = response.data.map(province => ({
      id: province.id,
      name_th: province.name_th,
      name_en: province.name_en
    }));
    res.json(provinces);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    res.status(500).json({ error: 'Error fetching provinces' });
  }
});

app.get('/api/thailand/districts/:province', async (req, res) => {
  try {
    const { province } = req.params;
    const response = await axios.get('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json');
    const districts = response.data
      .filter(district => district.province_id === parseInt(province))
      .map(district => ({
        id: district.id,
        name_th: district.name_th,
        name_en: district.name_en,
        province_id: district.province_id
      }));
    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Error fetching districts' });
  }
});

// Configure Winston logger with MySQL transport



const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss")
    }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
    new MySQLTransport()
  ]
});



// Use Morgan for HTTP request logging with custom format
const skipRegularRequests = (req, res) => {
  return res.statusCode === 200;
};

app.use(morgan('combined', {
  skip: skipRegularRequests,
  stream: {
    write: message => logger.info(message.trim())
  }
}));

// Middleware to authenticate token from HTTP-only cookie
function authenticateToken(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.sendStatus(401); // No token in cookies, unauthorized
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      // Clear invalid cookie
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      return res.sendStatus(403); // Invalid token, forbidden
    }
    req.user = user;
    next();
  });
}
async function createConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'coophelper'
  });
}



// New endpoint to import users from Excel
app.post('/api/users/import', authenticateToken, async (req, res) => {
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ error: 'Invalid user data' });
  }

  try {
    const connection = await createConnection();
    const insertPromises = users.map(async user => {
      const { username, password, role, first_name, last_name } = user;
      if (!username || !password || !role || !first_name || !last_name) {
        throw new Error('Missing username, password, role, first_name, or last_name');
      }

      // Password should already be hashed from frontend, but hash it again if it's not
      const hashedPassword = password.length === 64 ? password : hashPassword(password);

      // Insert new user into the users table
      const [userResult] = await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role]
      );

      const userId = userResult.insertId;

      // Insert corresponding entry into the students table
      await connection.execute(
        'INSERT INTO students (student_id, first_name, last_name, user_id) VALUES (?, ?, ?, ?)',
        [username, first_name, last_name, userId]
      );
    });

    await Promise.all(insertPromises);
    res.status(201).json({ success: true, message: 'Users imported successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error importing users' });
  }
});

// New endpoint to import companies from Excel
app.post('/api/companies/import', authenticateToken, async (req, res) => {
  const { companies } = req.body;

  if (!Array.isArray(companies) || companies.length === 0) {
    return res.status(400).json({ error: 'Invalid company data format or empty data' });
  }

  try {
    const connection = await createConnection();
    const insertPromises = companies.map(async company => {
      const { comp_id, thai_name, english_name, description, address, province, district, business_type, position, job_fields, job_description, benefits } = company;
      
      if (!comp_id || !thai_name || !english_name) {
        throw new Error('Missing required company fields');
      }

      // Handle job_fields conversion to JSON string
      let job_fields_json = null;
      if (job_fields) {
        try {
          if (typeof job_fields === 'string') {
            // ถ้าเป็น JSON string อยู่แล้ว
            job_fields_json = job_fields;
          } else if (Array.isArray(job_fields)) {
            // ถ้าเป็น array
            job_fields_json = JSON.stringify(job_fields);
          } else {
            // กรณีอื่นๆ แปลงเป็น array แล้ว stringify
            const fieldsArray = job_fields.toString().split(',').map(field => field.trim());
            job_fields_json = JSON.stringify(fieldsArray);
          }
        } catch (e) {
          console.error('Error processing job_fields:', e);
          job_fields_json = '[]';
        }
      }

      await connection.execute(
        'INSERT INTO company (comp_id, thai_name, english_name, description, address, province, district, business_type, position, job_fields, job_description, benefits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [comp_id, thai_name, english_name, description, address, province, district, business_type, position, job_fields_json, job_description, benefits]
      );
    });

    await Promise.all(insertPromises);
    res.status(201).json({ success: true, message: 'Companies imported successfully' });
  } catch (error) {
    console.error('Error importing companies:', error);
    res.status(500).json({ error: 'Error importing companies: ' + error.message });
  }
});


app.get('/company', async function (req, res) {
  let query = 'SELECT * FROM `company`';
  const queryParams = [];

  try {
    const connection = await createConnection();
    const [results] = await connection.query(query, queryParams);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database query error' });
  }
});

// Logout endpoint to clear the auth cookie
app.get('/check-session', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    const [userResults] = await connection.query('SELECT user_id, username, role FROM users WHERE user_id = ?', [req.user.user_id]);

    if (userResults.length > 0) {
      const user = userResults[0];
      res.json({
        authenticated: true,
        user_id: user.user_id,
        username: user.username,
        role: user.role
      });
    } else {
      res.status(401).json({ authenticated: false });
    }
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ error: 'Error checking session' });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/login', async function(req, res) {
  const { username, password } = req.body;

  const query = 'SELECT user_id, username, password, role, is_temp_password FROM users WHERE username = ?';
  try {
    const connection = await createConnection();
    const [results] = await connection.query(query, [username]);
    if (results.length > 0) {
      const user = results[0];

      // Compare passwords - support both hashed and unhashed passwords
      const hashedInputPassword = hashPassword(password);
      const defaultHashedPassword = hashPassword('111111');
      const isTemporaryPassword = user.is_temp_password === 1;

      // Check if the provided password matches (either hashed or unhashed)
      const passwordMatches =
        password === user.password || // Raw password match
        hashedInputPassword === user.password || // Hashed password match
        (isTemporaryPassword && password === user.password); // Temporary password match

      if (passwordMatches) {
        // Check if password is temporary or default
        if (password === '111111' || user.password === defaultHashedPassword || isTemporaryPassword) {
          return res.json({
            success: true,
            forcePasswordChange: true,
            message: 'Please change your temporary password',
            user_id: user.user_id,
            username: user.username,
            role: user.role
          });
        }

        // If login successful with unhashed password, update it to hashed version
        if (password === user.password) {
          try {
            await connection.execute(
              'UPDATE users SET password = ? WHERE user_id = ?',
              [hashedInputPassword, user.user_id]
            );
          } catch (updateError) {
            console.error('Error updating password hash:', updateError);
          }
        }

        // Create JWT token
        const token = jwt.sign(
          { user_id: user.user_id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '1h' }
        );

        // Set HTTP-only cookie
        res.cookie('authToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Use secure in production
          sameSite: 'strict',
          maxAge: 3600000 // 1 hour in milliseconds
        });

        logger.info({ message: `Login successful for user: ${user.username}`, action: 'login_success' });

        // Send response without token (token is in cookie)
        res.json({
          success: true,
          message: 'Login successful',
          user_id: user.user_id,
          username: user.username,
          role: user.role
        });
      } else {
        logger.warn({ message: `Invalid password attempt for username: ${username}`, action: 'invalid_password' });
        res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง' });
      }
    } else {
      logger.warn({ message: `Login attempt with unknown username: ${username}`, action: 'unknown_username' });
      res.status(401).json({ success: false, message: 'ไม่พบบัญชีผู้ใช้ กรุณาตรวจสอบและลองอีกครั้ง' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
});

app.get('/user/details', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const connection = await createConnection();

    const [studentDetails] = await connection.query('SELECT * FROM students WHERE user_id = ?', [userId]);
    if (studentDetails.length > 0) {
      return res.json({ role: 'student', details: studentDetails[0] });
    }

    const [officerDetails] = await connection.query('SELECT * FROM officer WHERE user_id = ?', [userId]);
    if (officerDetails.length > 0) {
      return res.json({ role: 'officer', details: officerDetails[0] });
    }

    res.status(404).json({ error: 'User details not found' });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user details' });
  }
});

app.get('/user/officer', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const connection = await createConnection();
    const query = `
      SELECT users.username, officer.*
      FROM users
      JOIN officer ON users.user_id = officer.user_id
      WHERE users.user_id = ?;
    `;
    const [results] = await connection.query(query, [userId]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching officer details' });
  }
});

app.get('/user/student', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const connection = await createConnection();
    const query = `
      SELECT users.username, students.*
      FROM users
      JOIN students ON users.user_id = students.user_id
      WHERE users.user_id = ?;
    `;
    const [results] = await connection.query(query, [userId]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching student details' });
  }
});

app.post('/applications', authenticateToken, async (req, res) => {
  const userId = req.user.user_id; // Get the user_id from the authenticated token
  const { studentId, compId } = req.body;
  const resume = req.files ? req.files.resume : null;
  const transcript = req.files ? req.files.transcript : null;

  if (!studentId || !compId) {
    return res.status(400).json({ error: 'Missing studentId or compId' });
  }

  try {
    const connection = await createConnection();

    const [studentCheck] = await connection.query('SELECT * FROM students WHERE student_id = ?', [studentId]);
    if (studentCheck.length === 0) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const [companyCheck] = await connection.query('SELECT * FROM company WHERE comp_id = ?', [compId]);
    if (companyCheck.length === 0) {
      return res.status(400).json({ error: 'Invalid company ID' });
    }
    
    // Save files and get their paths
    let resumePath = null;
    let transcriptPath = null;
    if (resume) {
      resumePath = `resume_${userId}_${resume.name}`;
      await resume.mv(path.join(uploadDir, resumePath));
    }
    if (transcript) {
      transcriptPath = `transcript_${userId}_${transcript.name}`;
      await transcript.mv(path.join(uploadDir, transcriptPath));
    }

    // Insert application with file paths
    const query = `
    INSERT INTO applications (student_id, comp_id, user_id, resume, transcript)
    VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(query, [studentId, compId, userId, resumePath, transcriptPath]);

    logger.info({ message: 'Application submitted successfully',company: compId, action: 'submit_application', applicationId: result.insertId });
    res.status(201).json({ success: true, message: 'Application submitted successfully', applicationId: result.insertId });
  } catch (error) {
    logger.error('Error inserting application:', error.message);
    res.status(500).json({ error: 'Error inserting application' });
  }
});

// เพิ่มตัวแปร cache สำหรับเก็บข้อมูล stats
let dailyLoginCache = {
  lastUpdate: null,
  data: null
};

// ฟังก์ชันสำหรับรีเซ็ต cache ทุกวันเวลา 03:00 น.
function setupDailyLoginCacheReset() {
  const now = new Date();
  const targetTime = new Date(now);
  targetTime.setHours(3, 0, 0, 0);

  // ถ้าเลยเวลา 03:00 น. แล้ว ให้เซ็ตเป็นวันถัดไป
  if (now > targetTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const timeUntilReset = targetTime - now;
  setTimeout(() => {
    dailyLoginCache.lastUpdate = null;
    dailyLoginCache.data = null;
    setupDailyLoginCacheReset(); // ตั้งเวลารีเซ็ตครั้งถัดไป
  }, timeUntilReset);
}

// เริ่มต้นระบบ cache reset

// Get application status distribution
app.get('/api/application-status', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    const [results] = await connection.execute(
      `SELECT status_list.status, 
            COALESCE(app_count.students_count, 0) AS students_count
      FROM (
          SELECT 'in progress' AS status
          UNION ALL SELECT 'ready'
          UNION ALL SELECT 'disqualified'
          UNION ALL SELECT 'passed'
          UNION ALL SELECT 'eliminated'
          UNION ALL SELECT 'confirmed'
          UNION ALL SELECT 'withdrawn'
      ) AS status_list
      LEFT JOIN (
          SELECT status, COUNT(*) AS students_count
          FROM applications
          WHERE status IN ('in progress', 'ready', 'disqualified', 'passed', 'eliminated', 'confirmed', 'withdrawn')
          GROUP BY status
      ) AS app_count ON status_list.status = app_count.status
      ORDER BY FIELD(status_list.status, 'in progress', 'ready', 'disqualified', 'passed', 'eliminated', 'confirmed', 'withdrawn');
      `
    );
    await connection.end();
    res.json(results);
  } catch (error) {
    console.error('Error fetching application status distribution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
setupDailyLoginCacheReset();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Endpoint สำหรับดึงข้อมูลการเข้าชมบริษัท
app.get('/api/company-views', authenticateToken, async (req, res) => {
  const days = parseInt(req.query.days) || 3; // Default to 3 days if not specified

  try {
    const connection = await createConnection();

    const query = `
      SELECT
        c.comp_id,
        c.thai_name,
        c.english_name,
        COUNT(a.log_id) AS company_views
      FROM company c
      LEFT JOIN activity_log a
        ON JSON_UNQUOTE(JSON_EXTRACT(a.details, '$.company')) = c.comp_id
        AND a.action = 'fetch_company'
        AND a.timestamp >= DATE_SUB(CURRENT_DATE, INTERVAL ? DAY)
      GROUP BY c.comp_id, c.thai_name, c.english_name
      ORDER BY company_views DESC
    `;

    const [results] = await connection.query(query, [days]);

    res.json(results);
  } catch (error) {
    logger.error('Error fetching company views:', error.message);
    res.status(500).json({ error: 'Error fetching company views statistics' });
  }
});

// Endpoint สำหรับดึงข้อมูลการ login รายวัน
// Endpoint สำหรับดึงข้อมูลจำนวนนักศึกษาในแต่ละสาขา
app.get('/api/stats/students-by-major', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    const query = `
      SELECT
        major,
        COUNT(*) AS students_count
      FROM students
      WHERE faculty = 'คณะวิทยาศาสตร์และเทคโนโลยี'
      GROUP BY major
      ORDER BY students_count DESC
    `;

    const [results] = await connection.query(query);
    res.json(results);
  } catch (error) {
    logger.error('Error fetching students by major:', error.message);
    res.status(500).json({ error: 'Error fetching students statistics' });
  }
});

app.get('/api/stats/daily-logins', authenticateToken, async (req, res) => {
  try {
    // ถ้ามี cache และยังไม่หมดอายุ (อายุไม่เกิน 1 วัน) ให้ใช้ข้อมูลจาก cache
    const now = new Date();
    if (dailyLoginCache.lastUpdate &&
        dailyLoginCache.data &&
        (now - dailyLoginCache.lastUpdate) < 24 * 60 * 60 * 1000) {
      return res.json(dailyLoginCache.data);
    }

    const connection = await createConnection();

    // ดึงข้อมูลการ login รายวัน จากตาราง logs
    const [loginStats] = await connection.query(`
      SELECT
        COUNT(*) as total_logins,
        COUNT(DISTINCT message) as student_logins
      FROM activity_log
      WHERE action = 'login_success'
      AND level = 'info'
      AND DATE(timestamp) = CURDATE()
    `);

    const stats = {
      total_logins: loginStats[0].total_logins,
      student_logins: loginStats[0].student_logins,
      last_updated: new Date().toISOString()
    };

    // เก็บข้อมูลลง cache
    dailyLoginCache.lastUpdate = now;
    dailyLoginCache.data = stats;

    connection.end();

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching daily login stats' });
  }
});

//profile edit
app.post('/api/profile', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;

  const {
    first_name,
    last_name,
    faculty,
    major,
    GPA,
    address,
    phone,
    email
  } = req.body;

  const resume = req.files ? req.files.resume : null;
  const transcript = req.files ? req.files.transcript : null;

  try {
    const connection = await createConnection();

    const query = `
      UPDATE students
      SET first_name = ?, last_name = ?, faculty = ?, major = ?, GPA = ?, address = ?, phone = ?, email = ?
      WHERE user_id = ?
    `;
    await connection.execute(query, [
      first_name,
      last_name,
      faculty,
      major,
      GPA,
      address,
      phone,
      email,
      userId
    ]);

    if (resume) {
      const resumePath = path.join(__dirname, 'uploads', `resume_${userId}_${resume.name}`);
      await resume.mv(resumePath);
      await connection.execute('UPDATE students SET resume = ? WHERE user_id = ?', [resumePath, userId]);

    }
    if (transcript) {
      const transcriptPath = path.join(__dirname, 'uploads', `transcript_${userId}_${transcript.name}`);
      await transcript.mv(transcriptPath);
      await connection.execute('UPDATE students SET transcript = ? WHERE user_id = ?', [transcriptPath, userId]);
    }
    
    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// Change a student's password
// Reset password endpoint (for admin/officer only)
app.post('/api/users/:userId/reset-password', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await createConnection();

    // Check if the requester is an admin/officer
    const [requester] = await connection.query(
      'SELECT role FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (!requester.length || requester[0].role !== 'officer') {
      return res.status(403).json({ error: 'Unauthorized. Only officers can reset passwords.' });
    }

    // Generate temporary password (don't hash it yet)
    const tempPassword = generateTempPassword();

    // Store the temporary password as-is and set is_temp_password flag
    await connection.execute(
      'UPDATE users SET password = ?, is_temp_password = 1 WHERE user_id = ?',
      [tempPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password has been reset',
      temporaryPassword: tempPassword
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
});

app.put('/students/:studentId/change-password', async (req, res) => {
  const { studentId } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' });
  }

  try {
    const connection = await createConnection();
    // Check if the student exists and get the current password and temp password status
    const [existingStudent] = await connection.query('SELECT password, is_temp_password FROM users WHERE username = ?', [studentId]);
    if (existingStudent.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const user = existingStudent[0];
    const defaultHashedPassword = hashPassword('111111');

    // Allow password change if:
    // 1. Current password is '111111' (default)
    // 2. Current password is hashed '111111'
    // 3. User has temporary password flag
    const isDefaultPassword = user.password === '111111' || user.password === defaultHashedPassword;
    const isTemporaryPassword = user.is_temp_password === 1;

    if (!isDefaultPassword && !isTemporaryPassword) {
      return res.status(403).json({ error: 'Password change not allowed. Please contact admin.' });
    }

    // Update the student's password with hashed version and reset temporary flag
    const query = 'UPDATE users SET password = ?, is_temp_password = 0 WHERE username = ?';
    const [result] = await connection.execute(query, [newPassword, studentId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Failed to update password' });
    }

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error changing password' });
  }
});

// Add this endpoint to handle student detail updates
app.put('/students/:studentId', authenticateToken, async (req, res) => {
  const { studentId } = req.params;
  const {
    firstName,
    lastName,
    major,
    address,
    phone,
    email,
    gpa
  } = req.body;

  try {
    const connection = await createConnection();
    const query = `
      UPDATE students
      SET first_name = ?, last_name = ?, major = ?, address = ?, phone = ?, email = ?, GPA = ?
      WHERE student_id = ?
    `;
    const [result] = await connection.execute(query, [
      firstName,
      lastName,
      major,
      address,
      phone,
      email,
      gpa,
      studentId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.status(200).json({ success: true, message: 'Student details updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating student details' });
  }
});

app.get('/applications/details', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const connection = await createConnection();
    const query = `
      WITH RankedApplications AS (
  SELECT 
    applications.application_id,
    applications.status,
    students.first_name,
    students.last_name,
    students.faculty,
    students.major,
    students.GPA,
    students.email,
    company.comp_id AS compId,
    company.thai_name AS company_name,
    company.english_name AS company_eng_name,
    company.description AS company_description,
    company.job_description AS job_description,
    company.job_fields AS job_fields,
    company.benefits AS benefits,
    ROW_NUMBER() OVER (
      PARTITION BY applications.student_id, applications.comp_id 
      ORDER BY applications.application_id DESC
    ) AS row_num
  FROM applications
  JOIN students ON applications.student_id = students.student_id
  JOIN company ON applications.comp_id = company.comp_id
  WHERE applications.user_id = ?
)
SELECT *
FROM RankedApplications
WHERE row_num = 1;

    `;
    const [results] = await connection.query(query, [userId]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching application details' });
  }
});



app.get('/applications/company/:compId', authenticateToken, async (req, res) => {
  const { compId } = req.params;

  try {
    const connection = await createConnection();
    const query =`
      SELECT 
        applications.application_id,
        applications.status,
        students.student_id,
        students.first_name,
        students.last_name,
        students.address,
        students.email,
        students.phone,
        students.major,
        students.GPA,
        applications.resume,
        applications.transcript,
        company.thai_name AS company_name,
        company.english_name AS company_eng_name,
        company.description AS company_description
      FROM applications
      JOIN students ON applications.student_id = students.student_id
      JOIN company ON applications.comp_id = company.comp_id
      WHERE applications.comp_id = ?
        AND applications.application_id IN (
            SELECT MAX(app.application_id)
            FROM applications app
            WHERE app.comp_id = applications.comp_id
            GROUP BY app.student_id
        );
      `;
    const [results] = await connection.query(query, [compId]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching application details' });
  }
});


app.get('/companies/:compId', authenticateToken, async (req, res) => {
  const { compId } = req.params;

  try {
    const connection = await createConnection();
    const query = `
      SELECT 
        *
      FROM company
      WHERE comp_id = ?;
    `;
    const [results] = await connection.query(query, [compId]);

    if (results.length > 0) {
      res.json(results[0]);
      console.log(results[0]);
      logger.info({
        message: `Company details fetched successfully: ${compId}`,
        action: 'fetch_company',
        status: 'success',
        company: compId
      });
    } else {
      res.status(404).json({ error: 'Company not found' });
    }
  } catch (error) {
    
    res.status(500).json({ error: 'Error fetching company details' });
  }
});



app.put('/applications/:applicationId', authenticateToken, async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  
  try {
    const connection = await createConnection();

    // Update the application status
    const query = `UPDATE applications SET status = ? WHERE application_id = ?`;
    const [result] = await connection.execute(query, [status, applicationId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // If the status is confirmed, update the student's coop_ready status
    if (status === 'confirmed') {
      // Retrieve the student_id associated with the application
      const [application] = await connection.query('SELECT student_id FROM applications WHERE application_id = ?', [applicationId]);
      if (application.length > 0) {
        const studentId = application[0].student_id;
        const updateStudentQuery = 'UPDATE students SET coop_ready = ? WHERE student_id = ?';
        await connection.execute(updateStudentQuery, ['completed', studentId]);
        logger.info({ message: 'Student coop_ready status updated to completed', action: 'update_student_status', studentId });
      } else {
      }
    }

    res.status(200).json({ success: true, message: 'Application status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating application status' });
  }
});

// Add this endpoint to create a new student account
app.post('/api/create-student-account', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    const connection = await createConnection();

    // Check if the username already exists
    const [existingUsers] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Insert new user into the users table
    const [userResult] = await connection.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, 'student']
    );

    const userId = userResult.insertId;

    // Insert corresponding entry into the students table
    await connection.execute(
      'INSERT INTO students (student_id, user_id) VALUES (?, ?)',
      [username, userId]
    );

    res.status(201).json({ success: true, message: 'Student account created successfully', user_id: userId });
  } catch (error) {
    res.status(500).json({ error: 'Error creating student account' });
  }
});

// Endpoint to fetch all students
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    const [students] = await connection.query('SELECT * FROM students');
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching students' });
  }
});

// Endpoint to update a student's details, including student_id
app.put('/api/students/:studentId', authenticateToken, async (req, res) => {
  const { studentId } = req.params; // This is the original student_id
  const {
    student_id, // New student_id
    first_name,
    last_name,
    faculty,
    major,
    GPA,
    address,
    phone,
    email
  } = req.body;

  try {
    const connection = await createConnection();

    // Check if the new student_id already exists and is different from the original
    const [existingStudent] = await connection.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
    if (existingStudent.length > 0 && existingStudent[0].student_id !== studentId) {
      return res.status(400).json({ error: 'Student ID already exists' });
    }

    const query = `
      UPDATE students
      SET student_id = ?, first_name = ?, last_name = ?, faculty = ?, major = ?, GPA = ?, address = ?, phone = ?, email = ?
      WHERE student_id = ?
    `;
    const [result] = await connection.execute(query, [
      student_id,
      first_name,
      last_name,
      faculty,
      major,
      GPA,
      address,
      phone,
      email,
      studentId // Use the original student_id for the WHERE clause
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json({ success: true, message: 'Student details updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating student details' });
  }
});



//ADMIN

// Add this endpoint to create a new user account
app.post('/api/users', authenticateToken, async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Missing username, password, or role' });
  }

  try {
    const connection = await createConnection();

    // Check if the username already exists
    const [existingUsers] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Password should already be hashed from frontend, but hash it again if it's not
    const hashedPassword = password.length === 64 ? password : hashPassword(password);

    // Insert new user into the users table
    const [userResult] = await connection.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );
    res.status(201).json({ success: true, message: 'User account created successfully', user_id: userResult.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user account' });
  }
});

// Endpoint to fetch all users
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    const [users] = await connection.query('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Endpoint to update a user's details
app.put('/api/users/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { username, password, role } = req.body;

  try {
    const connection = await createConnection();

    // Password should already be hashed from frontend, but hash it again if it's not
    const hashedPassword = password.length === 64 ? password : hashPassword(password);

    const query = `
      UPDATE users
      SET username = ?, password = ?, role = ?
      WHERE user_id = ?
    `;
    const [result] = await connection.execute(query, [username, hashedPassword, role, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    res.status(200).json({ success: true, message: 'User details updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating user details' });
  }
});

// Endpoint to delete a user
app.delete('/api/users/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const connection = await createConnection();
    const query = 'DELETE FROM users WHERE user_id = ?';
    const [result] = await connection.execute(query, [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});

// Fetch all companies
app.get('/api/companies', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    const [companies] = await connection.query('SELECT * FROM company');

    // Parse job_fields JSON for each company
    const processedCompanies = companies.map(company => {
      try {
        if (company.job_fields) {
          company.job_fields = JSON.parse(company.job_fields);
        }
      } catch (e) {
          logger.warn({
            message: 'Failed to parse job_fields JSON',
            action: 'fetch_companies',
            companyId: company.comp_id,
            error: e.message
          });
      }
      return company;
    });

    res.json(processedCompanies);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching companies' });
  }
});

// Add a new company
app.post('/api/companies', authenticateToken, async (req, res) => {
  const {
    comp_id,
    thai_name,
    english_name,
    description,
    address,
    province,
    district,
    business_type,
    position,
    job_fields,
    job_description,
    benefits
  } = req.body;

  try {
    const connection = await createConnection();

    // Convert job_fields to JSON string if it's an array
    const job_fields_json = Array.isArray(job_fields) ? JSON.stringify(job_fields) : job_fields;

    const query = `
      INSERT INTO company (
        comp_id,
        thai_name,
        english_name,
        description,
        address,
        province,
        district,
        business_type,
        position,
        job_fields,
        job_description,
        benefits
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(query, [
      comp_id,
      thai_name,
      english_name,
      description,
      address,
      province,
      district,
      business_type,
      position,
      job_fields_json,
      job_description,
      benefits
    ]);

    res.status(201).json({ success: true, message: 'Company added successfully', companyId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error adding company' });
  }
});

// Delete a company
app.delete('/api/companies/:compId', authenticateToken, async (req, res) => {
  const { compId } = req.params;

  try {
    const connection = await createConnection();

    // Check if there are any applications for this company
    const [applications] = await connection.query('SELECT * FROM applications WHERE comp_id = ?', [compId]);
    if (applications.length > 0) {
      return res.status(400).json({ error: 'Cannot delete company with existing applications' });
    }

    // Delete the company
    const query = 'DELETE FROM company WHERE comp_id = ?';
    const [result] = await connection.execute(query, [compId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.status(200).json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting company' });
  }
});

// Update company details
app.put('/api/companies/:compId', authenticateToken, async (req, res) => {
  const { compId } = req.params;
  const {
    thai_name,
    english_name,
    description,
    address,
    province,
    district,
    business_type,
    position,
    job_fields,
    job_description,
    benefits
  } = req.body;

  try {
    const connection = await createConnection();

    // Convert job_fields to JSON string if it's an array
    const job_fields_json = Array.isArray(job_fields) ? JSON.stringify(job_fields) : job_fields;

    const query = `
      UPDATE company
      SET thai_name = ?,
          english_name = ?,
          description = ?,
          address = ?,
          province = ?,
          district = ?,
          business_type = ?,
          position = ?,
          job_fields = ?,
          job_description = ?,
          benefits = ?
      WHERE comp_id = ?
    `;
    const [result] = await connection.execute(query,
      [
        thai_name,
        english_name,
        description,
        address,
        province,
        district,
        business_type,
        position,
        job_fields_json,
        job_description,
        benefits,
        compId
      ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.status(200).json({ success: true, message: 'Company details updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating company details' });
  }
});


// Example route to fetch a file
app.get('/files/:filename', authenticateToken, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
          return res.status(404).send('File not found');
      }
      res.sendFile(filePath);
  });
});


// Add this endpoint to update the coop_ready status of a student
app.put('/students/:studentId/coop-ready', authenticateToken, async (req, res) => {
  const { studentId } = req.params;
  const { coop_ready } = req.body;

  if (!coop_ready) {
    return res.status(400).json({ error: 'coop_ready status is required' });
  }

  try {
    const connection = await createConnection();
    const query = 'UPDATE students SET coop_ready = ? WHERE student_id = ?';
    const [result] = await connection.execute(query, [coop_ready, studentId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.status(200).json({ success: true, message: 'Coop ready status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating coop ready status' });
  }
});



//for dashboard
// Get dashboard statistics
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    const query = `
      SELECT
        (SELECT COUNT(*) FROM students) AS total_students,
        (SELECT COUNT(*) FROM company) AS total_company,
        (SELECT COUNT(*) FROM students WHERE coop_ready = 'completed') AS students_with_company,
        (SELECT COUNT(*) FROM applications) AS total_applications,
        (SELECT COUNT(*) FROM applications WHERE status = 'approved') AS approved_applications
    `;

    const [results] = await connection.query(query);
    const stats = results[0];

    // Calculate success rate
    const successRate = stats.total_applications > 0
      ? ((stats.approved_applications / stats.total_applications) * 100).toFixed(1)
      : 0;

    res.json({
      total_applications: stats.total_applications,
      active_companies: stats.total_company,
      total_students: stats.total_students,
      approved_applications: stats.approved_applications,
      student_ready: stats.students_with_company,
      success_rate: successRate
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dashboard stats' });
  }
});

// Endpoint สำหรับ dashboard stats
app.get('/api/dashboard/stats/', authenticateToken, async (req, res) => {
  try {
    // ถ้ามี cache และยังไม่หมดอายุ (อายุไม่เกิน 1 วัน) ให้ใช้ข้อมูลจาก cache
    const now = new Date();
    if (statsCache.lastUpdate &&
        statsCache.data &&
        (now - statsCache.lastUpdate) < 24 * 60 * 60 * 1000) {
      return res.json(statsCache.data);
    }

    const connection = await createConnection();

    // ดึงจำนวนนักศึกษาที่ login เข้าระบบวันนี้
    const [activeUsers] = await connection.query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM activity_log
      WHERE action = 'login_success'
      AND DATE(timestamp) = CURDATE()
    `);

    // ดึงจำนวนนักศึกษาทั้งหมด
    const [totalStudents] = await connection.query(`
      SELECT COUNT(*) as count
      FROM students
    `);

    // ดึงจำนวนบริษัทที่เปิดรับสมัคร
    const [activeCompanies] = await connection.query(`
      SELECT COUNT(*) as count
      FROM company
      WHERE status = 'active'
    `);

    // ดึงจำนวนนักศึกษาที่พร้อมฝึกงาน (มี GPA >= 2.00)
    const [studentReady] = await connection.query(`
      SELECT COUNT(*) as count
      FROM students
      WHERE GPA >= 2.00
    `);

    const stats = {
      active_users: activeUsers[0].count,
      total_students: totalStudents[0].count,
      active_companies: activeCompanies[0].count,
      student_ready: studentReady[0].count
    };

    // เก็บข้อมูลลง cache
    statsCache.lastUpdate = now;
    statsCache.data = stats;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dashboard stats' });
  }
});



