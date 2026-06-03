const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    slotNumber: {
        type: String,
        required: true,
        unique: true
    },
    floor: {
        type: String,
        required: true
    },
    slotType: {
        type: String,
        enum: ['BIKE', 'CAR', 'TRUCK'],
        required: true
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'OCCUPIED'],
        default: 'AVAILABLE'
    }
}, {
    timestamps: true
});

// This prevents the OverwriteModelError
module.exports = mongoose.models.Slot || mongoose.model('Slot', slotSchema);