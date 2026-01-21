const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getRequests, respondRequest, getLogs, getActiveConnections, revokeAccess, createDataOffering, getDataOfferings, updateDataOffering, deleteDataOffering, createDataRecord, updateDataRecord, getDataRecordByOfferingId } = require('../controllers/ownerController');
const router = express.Router();

router.get('/requests', protect, getRequests);
router.get('/connections', protect, getActiveConnections);
router.put('/request/:id', protect, respondRequest);
router.post('/revoke', protect, revokeAccess);
router.get('/logs', protect, getLogs);

router.post('/data-offerings', protect, createDataOffering);
router.get('/data-offerings', protect, getDataOfferings);
router.put('/data-offerings/:id', protect, updateDataOffering);
router.delete('/data-offerings/:id', protect, deleteDataOffering);

router.post('/data-records', protect, createDataRecord);
router.put('/data-records/:id', protect, updateDataRecord);
router.get('/data-records/:dataOfferingId', protect, getDataRecordByOfferingId); // New route to fetch a single data record by offering ID

module.exports = router;