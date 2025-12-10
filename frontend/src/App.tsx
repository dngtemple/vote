import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Voting from './pages/Voting';
import Results from './pages/Results';
import ThankYou from './pages/ThankYou';

function App() {
    return (
        <Router>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/vote" element={<Voting />} />
                <Route path="/results" element={<Results />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
