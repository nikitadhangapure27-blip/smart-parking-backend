const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = 'mongodb+srv://nikita:Nikita2005@cluster0.h0uuosj.mongodb.net/?appName=Cluster0';
    try {

        await mongoose.connect(uri);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;