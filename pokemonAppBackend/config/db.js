const config = require('../utils/env_variables');
const mongoose = require('mongoose');


const connectDB = async () => {
    try {
        console.log(config.MONGODB_URL);
        await mongoose.connect(config.MONGODB_URL);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;