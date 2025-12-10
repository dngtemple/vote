import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BarChart3, Trophy, Users, Check, X, Vote, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

import { API_BASE_URL } from '../config';

interface Candidate {
    _id: string;
    name: string;
    position: string;
    votes: number;
    noVotes: number;
}

interface Stats {
    totalVoters: number;
    votedVoters: number;
}

export default function Results() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [stats, setStats] = useState<Stats>({ totalVoters: 0, votedVoters: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('voter');
        navigate('/');
        toast.success('Logged out successfully');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resultsRes, statsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/results`),
                    fetch(`${API_BASE_URL}/stats`)
                ]);

                if (!resultsRes.ok) throw new Error('Failed to fetch results');
                // stats might fail if endpoint not ready, handle gracefully or throw

                const resultsData = await resultsRes.json();
                setCandidates(resultsData);

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                if (loading) toast.error('Failed to load live data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className='w-screen flex justify-center items-center h-screen'><Loader /></div>;

    const candidatesByPosition = candidates.reduce((acc, candidate) => {
        if (!acc[candidate.position]) {
            acc[candidate.position] = [];
        }
        acc[candidate.position].push(candidate);
        return acc;
    }, {} as { [key: string]: Candidate[] });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };



    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <motion.div
                className="max-w-5xl mx-auto space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto"
                    >
                        <BarChart3 className="w-10 h-10 text-indigo-600" />
                    </motion.div>

                    <div className="absolute top-4 right-4">
                        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                            <LogOut className="w-4 h-4" /> Logout
                        </Button>
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900">Live Election Results</h1>

                    {/* Stats Card */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-md mx-auto transform transition-all hover:scale-105"
                    >
                        <div className="flex items-center justify-center space-x-4">
                            <div className="p-3 bg-blue-50 rounded-full">
                                <Vote className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-gray-500">Voter Turnout</p>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-2xl font-bold text-gray-900">{stats.votedVoters}</span>
                                    <span className="text-gray-400">/</span>
                                    <span className="text-lg text-gray-600">{stats.totalVoters}</span>
                                    <span className="text-sm font-medium text-gray-500 ml-2">voters</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {Object.entries(candidatesByPosition).map(([position, positionCandidates]) => {
                        const isPresident = position === 'President';
                        const isUnopposed = positionCandidates.length === 1;

                        // Sort candidates by votes desc for display
                        const sortedCandidates = [...positionCandidates].sort((a, b) => b.votes - a.votes);

                        return (
                            <motion.div key={position} variants={itemVariants}>
                                <Card className="shadow-lg h-full border-t-4 border-t-indigo-500 overflow-hidden">
                                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b pb-4">
                                        <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
                                            {isPresident ? <Trophy className="w-5 h-5 text-yellow-500" /> : <Users className="w-5 h-5 text-gray-500" />}
                                            {position}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        {sortedCandidates.map((candidate) => (
                                            <div key={candidate._id} className="bg-white p-4 rounded-lg border shadow-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold text-lg text-gray-700">
                                                        {candidate.name}
                                                    </span>
                                                </div>

                                                {isPresident || !isUnopposed ? (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600 text-sm">Total Votes</span>
                                                        <motion.div
                                                            className="text-2xl font-bold text-primary"
                                                            initial={{ scale: 1 }}
                                                            key={candidate.votes} // Re-animate on vote change
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            {candidate.votes}
                                                        </motion.div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                                        <div className="text-center p-3 bg-green-50 rounded-md border border-green-100">
                                                            <div className="text-sm text-green-600 font-medium flex justify-center items-center gap-1"><Check className="w-3 h-3" /> Yes</div>
                                                            <div className="text-2xl font-bold text-green-700">{candidate.votes}</div>
                                                        </div>
                                                        <div className="text-center p-3 bg-red-50 rounded-md border border-red-100">
                                                            <div className="text-sm text-red-600 font-medium flex justify-center items-center gap-1"><X className="w-3 h-3" /> No</div>
                                                            <div className="text-2xl font-bold text-red-700">{candidate.noVotes || 0}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
