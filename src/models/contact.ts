import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name must be less than 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        maxlength: [50, 'Email must be less than 50 characters'],
        unique: [true, 'Email must be unique'],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [100, 'Subject must be less than 100 characters'],
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [500, 'Message must be less than 500 characters'],
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'replied'],
        default: 'pending',
    },{
    timestamps: true,
})

const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
