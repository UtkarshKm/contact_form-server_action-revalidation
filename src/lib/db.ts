import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        throw new Error('MONGO_URI is not defined in environment variables');
    }

    if (isConnected) {
        console.log('Already connected to MongoDB');
        return;
    }
    try {
        // Set strictQuery to false to prepare for Mongoose 7
        mongoose.set('strictQuery', false);
        await mongoose.connect(MONGO_URI);
        isConnected = true;
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
    }
}