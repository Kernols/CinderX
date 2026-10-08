const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { requireAuth } = require('../../../middlewares/clerk.middleware');

router.use(requireAuth);

router.post('/', reportController.submitReport);

module.exports = router;
