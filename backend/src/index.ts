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

app.use('/api/auth', authRoutes);
app.use('/api', voteRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Voting App API is running');
});

// Database connection
const MONGO_URI = process.env.MONGO_URI || '';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


// Conditionally listen
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} - Stats Endpoint Active`);
    });
}

export default app;
