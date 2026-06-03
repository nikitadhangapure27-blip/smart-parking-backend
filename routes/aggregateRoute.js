const express = require('express');
const router = express.Router();
const {
    activeVehicleAggregation,
    parkingDurationAggregation,
    dailyRevenueAnalytics
} = require('../controllers/aggregateController');

router.get('/active-vehicles', activeVehicleAggregation);

router.get('/parking-duration', parkingDurationAggregation);

router.get('/daily-revenue', dailyRevenueAnalytics);

module.exports = router;