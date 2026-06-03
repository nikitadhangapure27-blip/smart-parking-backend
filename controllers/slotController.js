const Slot = require('../models/slot');

// Creating a slot
exports.createSlot = async (req, res) => {
    try {
        const { slotNumber, floor, slotType } = req.body;
        
        // Check if slot already exists
        const existingSlot = await Slot.findOne({ slotNumber: slotNumber });
        if (existingSlot) {
            return res.status(400).json({
                success: false,
                message: 'Slot already exists !!'
            });
        }
        
        // Create new slot
        const slot = await Slot.create({ 
            slotNumber, 
            floor, 
            slotType,
            status: 'AVAILABLE'  // Explicitly set status
        });
        
        return res.status(201).json({
            success: true,
            message: 'Slot created successfully !!',
            data: slot
        });
    } catch (error) {
        console.error('Create slot error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Getting all slots
exports.getAllSlots = async (req, res) => {
    try {
        const slots = await Slot.find().sort({ floor: 1, slotNumber: 1 });
        return res.status(200).json({
            success: true,
            data: slots
        });
    } catch (error) {
        console.error('Get all slots error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get available slots by type
exports.availableSlots = async (req, res) => {
    try {
        const { slotType } = req.query;
        const query = { status: 'AVAILABLE' };
        if (slotType) {
            query.slotType = slotType;
        }
        const slots = await Slot.find(query);
        return res.status(200).json({
            success: true,
            data: slots
        });
    } catch (error) {
        console.error('Get available slots error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update slot status
exports.updateSlotStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        
        // Validate status
        if (!['AVAILABLE', 'OCCUPIED'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be AVAILABLE or OCCUPIED'
            });
        }
        
        const slot = await Slot.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );
        
        if (!slot) {
            return res.status(404).json({
                success: false,
                message: 'Slot not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Slot updated successfully !!',
            data: slot
        });
    } catch (error) {
        console.error('Update slot error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};