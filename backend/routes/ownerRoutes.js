const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getRequests, respondRequest, getLogs, getActiveConnections, revokeAccess } = require('../controllers/ownerController');
const router = express.Router();

router.get('/requests', protect, getRequests);
router.get('/connections', protect, getActiveConnections);
router.put('/request/:id', protect, respondRequest);
router.post('/revoke', protect, revokeAccess);
router.get('/logs', protect, getLogs);

module.exports = router;