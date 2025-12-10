const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        // 1. Login
        console.log('Testing Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            fullname: 'Voter 1',
            accessCode: 'CODE001'
        });
        const { token, voter } = loginRes.data;
        console.log('Login successful. Token received.');

        // 2. Get Candidates
        console.log('Fetching Candidates...');
        const candidatesRes = await axios.get(`${API_URL}/candidates`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const candidates = candidatesRes.data;
        console.log(`Fetched ${candidates.length} candidates.`);

        // 3. Vote
        console.log('Casting Vote...');
        // Find a candidate for "President"
        const president = candidates.find(c => c.position === 'President');
        if (!president) throw new Error('No President candidate found');

        const voteRes = await axios.post(`${API_URL}/vote`, {
            votes: { 'President': president._id }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Vote response:', voteRes.data.message);

        // 4. Get Results
        console.log('Fetching Results...');
        const resultsRes = await axios.get(`${API_URL}/results`);
        const updatedPresident = resultsRes.data.find(c => c._id === president._id);
        console.log(`President ${updatedPresident.name} has ${updatedPresident.votes} votes.`);

        if (updatedPresident.votes > 0) {
            console.log('TEST PASSED: Vote counted.');
        } else {
            console.log('TEST FAILED: Vote not counted.');
        }

    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received');
        }
    }
}

runTest();
