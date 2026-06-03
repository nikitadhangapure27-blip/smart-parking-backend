const express = require('express');
const router = express.Router();

// ✅ Make sure getBookingById is added inside the curly braces below
const { VehicleEntry, VehicleExit, getBookingById } = require('../controllers/bookingController');

router.post('/', VehicleEntry);
router.put('/exit/:id', VehicleExit);
router.get('/:id', getBookingById); // ✅ New route for QR Code ticket

module.exports = router;