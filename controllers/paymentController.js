const mongoose = require('mongoose');
const Payment = require('../models/payment');

exports.createPayment = async (req, res) => {
    try {
        const payload = req.body;
        if (!payload.bookingId || !payload.amount) {
            return res.status(400).json({ success: false, message: 'bookingId and amount are required' });
        }
        const payment = await Payment.create({
            bookingId: payload.bookingId,
            amount: payload.amount,
            paymentMethod: payload.paymentMethod || 'CASH',
            transactionId: payload.transactionId || undefined,
            status: payload.status || 'COMPLETED',
            paidAt: payload.paidAt || new Date()
        });
        return res.status(201).json({ success: true, data: payment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ DEEP POPULATION ADDED HERE
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate({
                path: 'bookingId',
                populate: [
                    { path: 'vehicleId' }, // Populates vehicle details inside booking
                    { path: 'slotId' }     // Populates slot details inside booking
                ]
            });
        return res.status(200).json({ success: true, data: payments });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ DEEP POPULATION ADDED HERE
exports.getPaymentById = async (req, res) => {
    try {
        const id = req.params.id;
        let payment = null;

        // Helper populate config
        const populateConfig = {
            path: 'bookingId',
            populate: [
                { path: 'vehicleId' },
                { path: 'slotId' }
            ]
        };

        // If valid ObjectId, try findById first
        if (mongoose.Types.ObjectId.isValid(id)) {
            payment = await Payment.findById(id).populate(populateConfig);
            if (payment) return res.status(200).json({ success: true, data: payment });
        }

        // Try transactionId as fallback
        payment = await Payment.findOne({ transactionId: id }).populate(populateConfig);
        if (payment) return res.status(200).json({ success: true, data: payment });

        // Try bookingId as fallback
        if (mongoose.Types.ObjectId.isValid(id)) {
            payment = await Payment.findOne({ bookingId: id }).populate(populateConfig);
            if (payment) return res.status(200).json({ success: true, data: payment });
        }

        return res.status(404).json({ success: false, message: 'Payment not found' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};