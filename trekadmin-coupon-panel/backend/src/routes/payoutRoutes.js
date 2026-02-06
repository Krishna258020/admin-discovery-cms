const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payoutController');

router.get('/', payoutController.getPayoutBatches);
router.post('/', payoutController.createPayoutBatch);

module.exports = router;
