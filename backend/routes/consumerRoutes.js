const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { searchOwner, sendRequest, getAccessList, getViewData, getConsumerDashboardStats, getConsumerApiKey } = require('../controllers/consumerController');
const router = express.Router();

router.get('/search', protect, searchOwner);
router.post('/request', protect, sendRequest);
router.get('/access-list', protect, getAccessList);
router.get('/data/:ownerId', protect, getViewData);
router.get('/dashboard-stats', protect, getConsumerDashboardStats);
router.get('/api-key', protect, getConsumerApiKey);

module.exports = router;