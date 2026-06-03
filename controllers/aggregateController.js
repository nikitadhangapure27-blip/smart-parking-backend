const Vehicle = require('../models/vehicle')
const Slot = require('../models/slot')
const Booking = require('../models/booking')
const Payment = require('../models/payment')

//Vehicle Booking entry
exports.VehicleEntry = async (req, res) => {
    try {
        const { vehicleId } = req.body
        const vehicle = await Vehicle.findById(vehicleId)
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found !!' })
        }
        const activeBooking = await Booking.findOne({ vehicleId, status: "ACTIVE" })
        if (activeBooking) {
            return res.status(400).json({ success: false, message: 'Vehicle already parked !!' })
        }
        const slot = await Slot.findOne({ slotType: vehicle.vehicleType, status: "AVAILABLE" })
        if (!slot) {
            return res.status(400).json({ success: false, message: 'No slot available' })
        }
        slot.status = "OCCUPIED"
        await slot.save()
        const booking = await Booking.create({ vehicleId, slotId: slot._id })
        return res.status(201).json({ success: true, message: 'Vehicle parked successfully !!', data: booking })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//Vehicle exit
exports.VehicleExit = async (req, res) => {
    try {
        const bookingId = req.params.id
        const booking = await Booking.findById(bookingId)
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found !!' })
        }
        if (booking.status === 'COMPLETED') {
            return res.status(400).json({ success: false, message: 'Vehicle already exited' })
        }
        const exitTime = new Date()
        const totalMiliseconds = exitTime - booking.entryTime
        const totalHours = Math.ceil(totalMiliseconds / (1000 * 60 * 60))
        let amount = 50
        if (totalHours > 2) {
            amount += (totalHours - 2) * 20
        }
        booking.exitTime = exitTime
        booking.totalHours = totalHours
        booking.status = "COMPLETED"
        await booking.save()
        const slot = await Slot.findById(booking.slotId)
        if (slot) {
            slot.status = "AVAILABLE"
            await slot.save()
        }
        const payment = await Payment.create({ bookingId: booking._id, amount, paymentMethod: "UPI" })
        return res.status(200).json({ success: true, message: 'Vehicle exited successfully !!', totalHours, amount, payment })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ✅ ADD THIS: Get active vehicle bookings
exports.activeVehicleAggregation = async (req, res) => {
    try {
        const activeBookings = await Booking.find({ status: 'ACTIVE' })
            .populate('vehicleId')
            .populate('slotId')
        return res.status(200).json({ success: true, data: activeBookings })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Parking duration aggregation
exports.parkingDurationAggregation = async (req, res) => {
    try {
        const stats = await Booking.aggregate([
            { $match: { status: 'COMPLETED', totalHours: { $exists: true } } },
            { $group: { _id: null, avgDuration: { $avg: '$totalHours' }, maxDuration: { $max: '$totalHours' }, minDuration: { $min: '$totalHours' }, totalBookings: { $sum: 1 } } }
        ])
        return res.status(200).json({ success: true, data: stats })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Daily revenue analytics
exports.dailyRevenueAnalytics = async (req, res) => {
    try {
        const revenue = await Payment.aggregate([
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } }, totalRevenue: { $sum: '$amount' }, totalPayments: { $sum: 1 } } },
            { $sort: { _id: -1 } },
            { $limit: 30 }
        ])
        return res.status(200).json({ success: true, data: revenue })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}