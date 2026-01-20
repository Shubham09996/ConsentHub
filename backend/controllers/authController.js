const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { email, password, role, firstName, lastName } = req.body;

  if (!email || !password || !role || !firstName || !lastName) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = uuidv4();

    // Create User
    await db.query(
      'INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, role, firstName, lastName]
    );

    // If Owner, create a dummy data record for them
    if (role === 'owner') {
      const recordId = uuidv4();
      const dummyData = JSON.stringify({
        creditScore: 750,
        healthRecord: "Fit",
        lastCheckup: "2024-01-20"
      });
      await db.query('INSERT INTO data_records (id, owner_id, data_payload) VALUES (?, ?, ?)', [recordId, userId, dummyData]);
    }

    res.status(201).json({
      id: userId,
      email,
      role,
      token: generateToken(userId, role)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    if (await bcrypt.compare(password, user.password_hash)) {
      // Log Login Action (Audit)
      const logId = uuidv4();
      await db.query(
        'INSERT INTO audit_logs (id, actor_id, action_type, status) VALUES (?, ?, ?, ?)',
        [logId, user.id, 'LOGIN', 'SUCCESS']
      );

      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        token: generateToken(user.id, user.role)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = { registerUser, loginUser };