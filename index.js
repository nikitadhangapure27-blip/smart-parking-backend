const express = require('express')
const cors = require('cors')
const connectDB = require('./utils/db')

const vehicleRoute = require('./routes/vehicleRoute')
const paymentRoute = require('./routes/paymentRoute')
const bookingRoute = require('./routes/bookingRoute')
const slotRoute = require('./routes/slotRoute')
const aggregateRoute = require('./routes/aggregateRoute')
const authRoute = require('./routes/authRoute')

connectDB()

const server = express()   // ✅ THIS LINE WAS MISSING!

server.use(cors())
server.use(express.json())
server.use('/api/vehicle', vehicleRoute)
server.use('/api/payment', paymentRoute)
server.use('/api/booking', bookingRoute)
server.use('/api/slot', slotRoute)
server.use('/api/aggregate', aggregateRoute)
server.use('/api/auth', authRoute)

server.listen(2705, () => {
    console.log('Server started listening on port 2705')
})