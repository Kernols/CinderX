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

// Battles management
router.post('/battles/:matchId/cancel', adminController.cancelBattle);
router.post('/battles/:matchId/finalize', adminController.finalizeBattle);
router.post('/battles/:matchId/refund', adminController.refundBattle);

// Treasury
router.get('/treasury', adminController.getTreasury);

// Moderation
router.get('/reports', adminController.getReports);
router.patch('/reports/:reportId', adminController.resolveReport);

module.exports = router;
