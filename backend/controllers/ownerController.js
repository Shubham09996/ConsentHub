const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc    Get Pending Requests
// @route   GET /api/owner/requests
const getRequests = async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT cr.id, u.first_name, u.last_name, u.company, cr.purpose, cr.created_at 
       FROM consent_requests cr 
       JOIN users u ON cr.consumer_id = u.id 
       WHERE cr.owner_id = ? AND cr.status = 'PENDING'`,
      [req.user.id]
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Active Connections
// @route   GET /api/owner/connections
const getActiveConnections = async (req, res) => {
    try {
      const [connections] = await db.query(
        `SELECT cr.id, u.first_name, u.last_name, u.company, cr.purpose, cr.updated_at as since
         FROM consent_requests cr 
         JOIN users u ON cr.consumer_id = u.id 
         WHERE cr.owner_id = ? AND cr.status = 'APPROVED'`,
        [req.user.id]
      );
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// @desc    Respond to Request (Approve/Reject)
// @route   PUT /api/owner/request/:id
const respondRequest = async (req, res) => {
  const { status } = req.body; // 'APPROVED' or 'REJECTED'
  const requestId = req.params.id;

  try {
    await db.query('UPDATE consent_requests SET status = ? WHERE id = ?', [status, requestId]);

    // Audit Log
    const actionType = status === 'APPROVED' ? 'APPROVE_ACCESS' : 'DENY_ACCESS';
    await db.query(
      'INSERT INTO audit_logs (id, actor_id, action_type, target_id) VALUES (?, ?, ?, ?)',
      [uuidv4(), req.user.id, actionType, requestId]
    );

    res.json({ message: `Request ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke Access
// @route   POST /api/owner/revoke
const revokeAccess = async (req, res) => {
    const { connectionId } = req.body;
  
    try {
      await db.query('UPDATE consent_requests SET status = "REVOKED" WHERE id = ?', [connectionId]);
  
      // Audit Log
      await db.query(
        'INSERT INTO audit_logs (id, actor_id, action_type, target_id) VALUES (?, ?, ?, ?)',
        [uuidv4(), req.user.id, 'REVOKE_ACCESS', connectionId]
      );
  
      res.json({ message: 'Access Revoked Successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// @desc    Get Audit Logs
// @route   GET /api/owner/logs
const getLogs = async (req, res) => {
  try {
    const [logs] = await db.query(
      'SELECT action_type, status, timestamp, target_id FROM audit_logs WHERE actor_id = ? ORDER BY timestamp DESC',
      [req.user.id]
    );
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRequests, respondRequest, getLogs, getActiveConnections, revokeAccess };