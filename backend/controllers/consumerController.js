const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc    Search Data Owners
// @route   GET /api/consumer/search?email=...
const searchOwner = async (req, res) => {
  const { email } = req.query;
  try {
    const [users] = await db.query(
      'SELECT id, first_name, last_name, email, company FROM users WHERE email LIKE ? AND role = "owner"',
      [`%${email}%`]
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Data Owners
// @route   GET /api/consumer/owners
const getAllOwners = async (req, res) => {
  try {
    const [owners] = await db.query(
      'SELECT id, first_name, last_name, email, company FROM users WHERE role = "owner"'
    );
    res.json(owners);
  } catch (error) {
    console.error('Error in getAllOwners:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send Access Request
// @route   POST /api/consumer/request
const sendRequest = async (req, res) => {
  const { ownerId, purpose, dataOfferingId } = req.body;
  console.log('sendRequest - Received dataOfferingId:', dataOfferingId);
  try {
    const id = uuidv4();
    await db.query(
      'INSERT INTO consent_requests (id, consumer_id, owner_id, status, purpose, data_offering_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.user.id, ownerId, 'PENDING', purpose, dataOfferingId]
    );

    await db.query(
      'INSERT INTO audit_logs (id, actor_id, action_type, target_id) VALUES (?, ?, ?, ?)',
      [uuidv4(), req.user.id, 'REQUEST_ACCESS', id]
    );

    res.status(201).json({ message: 'Request Sent' });
  } catch (error) {
    res.status(500).json({ message: 'Request already exists or failed' });
  }
};

// @desc    Get My Access List
// @route   GET /api/consumer/access-list
const getAccessList = async (req, res) => {
  try {
    console.log('getAccessList - req.user.id:', req.user.id);
    const [list] = await db.query(
`SELECT cr.id, cr.status, u.first_name, u.email, u.company, cr.owner_id, cr.data_offering_id, do.sensitivity, do.category, cr.created_at 
     FROM consent_requests cr 
     JOIN users u ON cr.owner_id = u.id 
     LEFT JOIN data_offerings do ON cr.data_offering_id = do.id 
     WHERE cr.consumer_id = ?`,
      [req.user.id]
    );
    res.json(list);
  } catch (error) {
    console.error('Error in getAccessList:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    View Secure Data
// @route   GET /api/consumer/data/:ownerId
const getViewData = async (req, res) => {
  const { ownerId } = req.params;
  const { dataOfferingId } = req.query; // Get dataOfferingId from query parameters
  try {
    // 1. Check Consent Status and get data_offering_id
    const [consent] = await db.query(
      'SELECT status FROM consent_requests WHERE consumer_id = ? AND owner_id = ? AND data_offering_id = ?',
      [req.user.id, ownerId, dataOfferingId]
    );

    if (consent.length === 0 || consent[0].status !== 'APPROVED') {
      return res.status(403).json({ message: 'Access Denied or Revoked' });
    }

    // 2. Fetch Data from data_records using data_offering_id and ownerId
    const [record] = await db.query('SELECT data_payload FROM data_records WHERE data_offering_id = ? AND owner_id = ?', [dataOfferingId, ownerId]);
    
    if (record.length === 0) {
        return res.status(404).json({ message: 'No data found for this specific data offering.' });
    }

    // 3. Log the VIEW action (Audit)
    await db.query(
      'INSERT INTO audit_logs (id, actor_id, action_type, target_id) VALUES (?, ?, ?, ?)',
      [uuidv4(), req.user.id, 'VIEW_DATA', dataOfferingId]
    );

    res.json(record[0].data_payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Consumer Dashboard Stats
// @route   GET /api/consumer/dashboard-stats
const getConsumerDashboardStats = async (req, res) => {
  try {
   console.log('getConsumerDashboardStats - req.user.id:', req.user.id);
    // Active Connections
    const [activeConnections] = await db.query(`SELECT COUNT(*) AS count FROM consent_requests WHERE consumer_id = ? AND status = 'APPROVED'`, [req.user.id]);

    // Pending Requests
    const [pendingRequests] = await db.query(`SELECT COUNT(*) AS count FROM consent_requests WHERE consumer_id = ? AND status = 'PENDING'`, [req.user.id]);

    // Total API Calls (assuming audit_logs tracks API calls and action_type for VIEW_DATA is an API call)
    const [totalApiCalls] = await db.query(`SELECT COUNT(*) AS count FROM audit_logs WHERE actor_id = ? AND action_type = 'VIEW_DATA'`, [req.user.id]);

    res.json({
      activeConnections: activeConnections[0].count,
      pendingRequests: pendingRequests[0].count,
      totalApiCalls: totalApiCalls[0].count,
    });
  } catch (error) {
    console.error('Error in getConsumerDashboardStats:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Consumer API Key
// @route   GET /api/consumer/api-key
const getConsumerApiKey = async (req, res) => {
  try {
    // For simplicity, we'll use a deterministic API key generation based on user ID.
    // In a real application, this would involve proper API key management (e.g., generating, storing hashed keys, rotating).
    const apiKey = `sk_consumer_${req.user.id.substring(0, 8)}_${process.env.JWT_SECRET.substring(0, 8)}`;
    res.json({ apiKey });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Data Offerings by Owner for Consumer
// @route   GET /api/consumer/data-offerings/:ownerId
const getDataOfferingsByOwner = async (req, res) => {
  const { ownerId } = req.params;
  try {
    const [offerings] = await db.query(
      'SELECT id, name, description, sensitivity, category FROM data_offerings WHERE owner_id = ?',
      [ownerId]
    );
    res.json(offerings);
  } catch (error) {
    console.error('Error in getDataOfferingsByOwner:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchOwner, sendRequest, getAccessList, getViewData, getConsumerDashboardStats, getConsumerApiKey, getDataOfferingsByOwner, getAllOwners };