const express = require('express');
const router = express.Router();
const {
    createSlot,
    getAllSlots,
    availableSlots,
    updateSlotStatus
} = require('../controllers/slotController');

// Create a new slot
router.post('/', createSlot);

// Get all slots
router.get('/', getAllSlots);

// Get available slots by type
router.get('/available', availableSlots);

// Update slot status
router.put('/:id', updateSlotStatus);

module.exports = router;