import express from 'express';
import Voter from '../models/Voter';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { fullname, accessCode } = req.body;

    try {
        const voter = await Voter.findOne({ fullname, accessCode });
        if (!voter) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }



        const token = jwt.sign({ id: voter._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token, voter });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
