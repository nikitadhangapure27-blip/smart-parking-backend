const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        // ✅ Use Render Environment Variable FIRST, otherwise use your local Atlas link
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://nikita:Nikita2005@cluster0.h0uuosj.mongodb.net/?retryWrites=true&w=majority')
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

module.exports = connectDB