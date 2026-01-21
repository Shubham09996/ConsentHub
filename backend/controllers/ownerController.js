const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc    Get Pending Requests
// @route   GET /api/owner/requests
const getRequests = async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT cr.id, u.first_name, u.last_name, u.company, cr.purpose, cr.created_at, do.name as data_offering_name
       FROM consent_requests cr 
       JOIN users u ON cr.consumer_id = u.id 
       LEFT JOIN data_offerings do ON cr.data_offering_id = do.id
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
      const [request] = await db.query(
        'SELECT * FROM consent_requests WHERE id = ? AND owner_id = ?',
        [connectionId, req.user.id]
      );

      if (request.length === 0) {
        return res.status(404).json({ message: 'Access request not found or you don\'t have permission.' });
      }

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


// @desc    Create Data Offering
// @route   POST /api/owner/data-offerings
const createDataOffering = async (req, res) => {
  const { name, description, sensitivity, category, dataPayload } = req.body; // Added dataPayload
  try {
    const offeringId = uuidv4();
    await db.query(
      'INSERT INTO data_offerings (id, owner_id, name, description, sensitivity, category) VALUES (?, ?, ?, ?, ?, ?)',
      [offeringId, req.user.id, name, description, sensitivity, category]
    );

    // Also create a corresponding data record
    const recordId = uuidv4();
    await db.query(
      'INSERT INTO data_records (id, data_offering_id, owner_id, data_payload) VALUES (?, ?, ?, ?)',
      [recordId, offeringId, req.user.id, JSON.stringify(dataPayload || { message: "No data yet." })]
    );

    res.status(201).json({ message: 'Data Offering and Record Created', offeringId });
  } catch (error) {
    console.error('Error creating data offering or record:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Data Offerings
// @route   GET /api/owner/data-offerings
const getDataOfferings = async (req, res) => {
  try {
    const [offerings] = await db.query(
      'SELECT id, name, description, sensitivity, category, created_at FROM data_offerings WHERE owner_id = ?',
      [req.user.id]
    );
    res.json(offerings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Data Offering
// @route   PUT /api/owner/data-offerings/:id
const updateDataOffering = async (req, res) => {
  const { name, description, sensitivity, category, dataPayload } = req.body; // Added dataPayload
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE data_offerings SET name = ?, description = ?, sensitivity = ?, category = ? WHERE id = ? AND owner_id = ?',
      [name, description, sensitivity, category, id, req.user.id]
    );

    // Also update the corresponding data record
    await db.query(
      'UPDATE data_records SET data_payload = ? WHERE data_offering_id = ? AND owner_id = ?',
      [JSON.stringify(dataPayload || { message: "No data yet." }), id, req.user.id]
    );

    res.json({ message: 'Data Offering and Record Updated' });
  } catch (error) {
    console.error('Error updating data offering or record:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Data Offering
// @route   DELETE /api/owner/data-offerings/:id
const deleteDataOffering = async (req, res) => {
  const { id } = req.params;
  try {
    // Delete associated consent requests first
    await db.query('DELETE FROM consent_requests WHERE data_offering_id = ? AND owner_id = ?', [id, req.user.id]);
    // Then delete associated data records
    await db.query('DELETE FROM data_records WHERE data_offering_id = ? AND owner_id = ?', [id, req.user.id]);
    // Finally, delete the data offering
    await db.query('DELETE FROM data_offerings WHERE id = ? AND owner_id = ?', [id, req.user.id]);
    res.json({ message: 'Data Offering and associated records Deleted' });
  } catch (error) {
    console.error('Error deleting data offering or record:', error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Create Data Record
// @route   POST /api/owner/data-records
const createDataRecord = async (req, res) => {
  const { dataOfferingId, dataPayload } = req.body;
  console.log('createDataRecord - Received dataOfferingId:', dataOfferingId, 'dataPayload:', dataPayload);
  try {
    const id = uuidv4();
    await db.query(
      'INSERT INTO data_records (id, data_offering_id, owner_id, data_payload) VALUES (?, ?, ?, ?)',
      [id, dataOfferingId, req.user.id, JSON.stringify(dataPayload)]
    );
    console.log('createDataRecord - Data record created successfully with ID:', id);
    res.status(201).json({ message: 'Data Record Created', id });
  } catch (error) {
    console.error('createDataRecord - Error creating data record:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Data Record
// @route   PUT /api/owner/data-records/:id
const updateDataRecord = async (req, res) => {
  const { dataPayload } = req.body;
  const { id } = req.params; // This `id` is the data_offering_id
  console.log('updateDataRecord - Received dataOfferingId:', id, 'dataPayload:', dataPayload);
  try {
    await db.query(
      'UPDATE data_records SET data_payload = ? WHERE data_offering_id = ? AND owner_id = ?',
      [JSON.stringify(dataPayload), id, req.user.id]
    );
    console.log('updateDataRecord - Data record updated successfully for dataOfferingId:', id);
    res.json({ message: 'Data Record Updated' });
  } catch (error) {
    console.error('updateDataRecord - Error updating data record:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Data Record by Offering ID
// @route   GET /api/owner/data-records/:dataOfferingId
const getDataRecordByOfferingId = async (req, res) => {
  const { dataOfferingId } = req.params;
  try {
    const [record] = await db.query(
      'SELECT data_payload FROM data_records WHERE data_offering_id = ? AND owner_id = ?',
      [dataOfferingId, req.user.id]
    );
    if (record.length > 0) {
      res.json(record[0].data_payload);
    } else {
      res.status(404).json({ message: 'Data record not found for this offering.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRequests, respondRequest, getLogs, getActiveConnections, revokeAccess, createDataOffering, getDataOfferings, updateDataOffering, deleteDataOffering, createDataRecord, updateDataRecord, getDataRecordByOfferingId };
