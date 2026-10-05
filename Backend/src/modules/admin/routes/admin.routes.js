const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAuth, requireAdmin } = require('../../../middlewares/clerk.middleware');

router.use(requireAuth, requireAdmin);

router.get('/overview', adminController.getOverview);

router.get('/users', adminController.getUsers);
router.patch('/users/:userId', adminController.updateUserStatus);

router.get('/config', adminController.getConfig);
router.post('/config', adminController.updateConfig);

router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
