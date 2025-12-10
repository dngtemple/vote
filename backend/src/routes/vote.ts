import express from 'express';
import Candidate from '../models/Candidate';
import Voter from '../models/Voter';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to authenticate token
const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Get all candidates
router.get('/candidates', authenticateToken, async (req, res) => {
    try {
        const candidates = await Candidate.find();
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Cast vote
router.post('/vote', authenticateToken, async (req: any, res: any) => {
    const { votes } = req.body; // Expecting { candidateId: position } or similar, actually { position: candidateId } map
    const userId = req.user.id;

    try {
        const voter = await Voter.findById(userId);
        if (!voter) return res.status(404).json({ message: 'Voter not found' });
        if (voter.hasVoted) return res.status(403).json({ message: 'Already voted' });

        // Update votes
        // votes is an object like { "President": { candidateId: "...", type: "yes" | "no" } }
        const positions = Object.keys(votes);
        for (const position of positions) {
            const voteData = votes[position];

            let candidateId: string;
            let type: 'yes' | 'no' = 'yes';

            if (typeof voteData === 'string') {
                candidateId = voteData;
            } else {
                candidateId = voteData.candidateId;
                type = voteData.type;
            }

            if (type === 'yes') {
                await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });
            } else {
                await Candidate.findByIdAndUpdate(candidateId, { $inc: { noVotes: 1 } });
            }
        }

        voter.hasVoted = true;
        await voter.save();

        res.json({ message: 'Vote cast successfully' });
    } catch (error) {
        console.error('Vote Error:', error);
        res.status(500).json({ message: 'Server error', error: String(error) });
    }
});

// Get results (public or protected? User said "results page", implied for everyone or maybe after voting? Let's make it public for now or protected)
// Usually results are public.
router.get('/results', async (req, res) => {
    try {
        const candidates = await Candidate.find();
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get voting statistics
router.get('/stats', async (req, res) => {
    try {
        const totalVoters = await Voter.countDocuments({});
        const votedVoters = await Voter.countDocuments({ hasVoted: true });
        console.log(`Stats request: Total=${totalVoters}, Voted=${votedVoters}`);
        res.json({ totalVoters, votedVoters });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
