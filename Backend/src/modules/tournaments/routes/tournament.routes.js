
const express = require('express');
const router = express.Router();
const tournController = require('../controllers/tournament.controller');
const { requireAuth } = require('../../../middlewares/clerk.middleware');

router.get('/', tournController.listTournaments);
router.post('/:id/join', requireAuth, tournController.joinTournament);
module.exports = router;
