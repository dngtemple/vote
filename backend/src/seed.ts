import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Candidate from './models/Candidate';
import Voter from './models/Voter';

dotenv.config();

const candidates = [
    { name: 'ADWOA SERWAA', position: 'Woman Organizer' },
    { name: 'ADWOA SERWAA', position: 'Culture Officer' },
    { name: 'KETEKU MAWUKEMOR KOFI', position: 'Communication Officer' },
    { name: 'MOHAMMED HAFIZ', position: 'President' },
    { name: 'DERRICK KROPAH DEI', position: 'General Secretary' },
    { name: 'KAFUI ADZO ONDO', position: 'President' },
    { name: 'JENNIFER DEI', position: 'Treasurer' },
    { name: 'SHADRACH AKWAH QUANSAH', position: 'Financial Secretary' },
    { name: 'UMAR SALISU', position: 'Youth and Sports Officer' },
    { name: 'ADAMS HAIRAT', position: 'Organiser' },
    { name: 'FRANCIS DONKOR', position: 'Protocol Officer' },
];

const generateVoters = () => {
    const voters = [];
    for (let i = 1; i <= 40; i++) {
        voters.push({
            fullname: `Voter ${i}`,
            accessCode: `CODE${i.toString().padStart(3, '0')}`, // CODE001, CODE002...
            hasVoted: false,
        });
    }
    return voters;
};

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('MongoDB connected');

        await Candidate.deleteMany({});
        await Voter.deleteMany({});

        await Candidate.insertMany(candidates);
        console.log('Candidates seeded');

        await Voter.insertMany(generateVoters());
        console.log('Voters seeded');

        mongoose.disconnect();
        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
