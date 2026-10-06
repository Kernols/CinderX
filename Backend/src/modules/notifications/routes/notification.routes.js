
const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notification.controller');
const { requireAuth } = require('../../../middlewares/clerk.middleware');

router.use(requireAuth);
router.get('/', notifController.getNotifications);
router.post('/read', notifController.markRead);
module.exports = router;
