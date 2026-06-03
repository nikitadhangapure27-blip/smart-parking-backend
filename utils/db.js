const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = 'mongodb+srv://nikitadhangapure:Nikita12345@cluster0.tz7vmk1.mongodb.net/?appName=Cluster0';
    try {

        await mongoose.connect(uri);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;