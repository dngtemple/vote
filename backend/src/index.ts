import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth';
import voteRoutes from './routes/vote';

// Database connection with caching for Serverless
const MONGO_URI = process.env.MONGO_URI || '';
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Fail after 5s if DB unreachable
            socketTimeoutMS: 45000,
        });
        isConnected = true;
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    await connectDB();
    if (!isConnected) {
        return res.status(503).json({ error: 'Database connection failed', message: 'Service Temporarily Unavailable' });
    }
    next();
});

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/', voteRoutes);

// Mount router at both /api and / to handle potential Vercel path stripping
app.use('/api', router);
app.use('/', router);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Voting App API is running' });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} - Stats Endpoint Active`);
    });
}

export default app;
