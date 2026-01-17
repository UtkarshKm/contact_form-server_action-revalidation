import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
}

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log('Already connected to MongoDB');
        return;
    }
    try {
        await mongoose.connect(MONGO_URI);
        isConnected = true;
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
    }
}