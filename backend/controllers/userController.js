const db = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const [user] = await db.query(
      'SELECT id, first_name, last_name, email, role, phone, location, bio, company, website FROM users WHERE id = ?',
      [req.user.id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
const updateProfile = async (req, res) => {
  const { firstName, lastName, phone, location, bio, company, website } = req.body;

  try {
    await db.query(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, location = ?, bio = ?, company = ?, website = ? WHERE id = ?`,
      [firstName, lastName, phone, location, bio, company, website, req.user.id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/user/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Verify current password
    const [user] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (user.length === 0 || !(await bcrypt.compare(currentPassword, user[0].password_hash))) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNewPassword, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
