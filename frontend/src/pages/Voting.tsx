import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';
import { motion } from 'framer-motion';
import { Vote, CheckCircle2, Send, BarChart3, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

interface Candidate {
    _id: string;
    name: string;
    position: string;
}

interface VoteData {
    candidateId: string;
    type: 'yes' | 'no';
}

export default function Voting() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [votes, setVotes] = useState<{ [key: string]: VoteData }>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkVoterStatus = () => {
            const voterData = localStorage.getItem('voter');
            if (voterData) {
                const voter = JSON.parse(voterData);
                if (voter.hasVoted) {
                    setHasVoted(true);
                    setLoading(false);
                    return true;
                }
            }
            return false;
        };

        if (checkVoterStatus()) return;

        const fetchCandidates = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/candidates`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 403) {
                    // Fallback if backend still blocks or returns specific "already voted" code for candidates
                    setHasVoted(true);
                    return;
                }

                if (!response.ok) throw new Error('Failed to fetch candidates');
                const data = await response.json();
                setCandidates(data);
            } catch (err: any) {
                toast.error(err.message || 'Failed to load candidates');
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, [navigate]);

    const handleVoteChange = (position: string, candidateId: string) => {
        setVotes((prev) => ({ ...prev, [position]: { candidateId, type: 'yes' } }));
    };

    const handleYesNoChange = (position: string, candidateId: string, value: string) => {
        setVotes((prev) => ({
            ...prev,
            [position]: { candidateId, type: value as 'yes' | 'no' }
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const token = localStorage.getItem('token');

        const submitPromise = async () => {
            const response = await fetch(`${API_BASE_URL}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ votes }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || data.message || 'Voting failed');
            }

            // Update local storage to reflect voted status
            const voterData = localStorage.getItem('voter');
            if (voterData) {
                const voter = JSON.parse(voterData);
                voter.hasVoted = true;
                localStorage.setItem('voter', JSON.stringify(voter));
            }

            navigate('/thank-you');
            return 'Vote cast successfully!';
        };

        toast.promise(submitPromise(), {
            loading: 'Submitting your vote...',
            success: (msg) => msg,
            error: (err) => err.message,
        })
            .finally(() => setSubmitting(false));
    };

    if (loading) return <div className='w-screen flex justify-center items-center h-screen'><Loader /></div>;

    if (hasVoted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="shadow-xl border-l-4 border-l-blue-500">
                        <CardHeader className="text-center space-y-4 pb-2">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                <Lock className="w-8 h-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-800">Vote Already Cast</CardTitle>
                            <CardDescription className="text-lg">
                                You have already participated in this election.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">

                            <Button
                                onClick={() => navigate('/')}
                                className="w-full h-12 text-sm"
                                variant="default"
                            >
                                logout
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // Group candidates by position
    const candidatesByPosition = candidates.reduce((acc, candidate) => {
        if (!acc[candidate.position]) {
            acc[candidate.position] = [];
        }
        acc[candidate.position].push(candidate);
        return acc;
    }, {} as { [key: string]: Candidate[] });

    const positions = Object.keys(candidatesByPosition);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <motion.div
                className="max-w-3xl mx-auto space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="text-center space-y-2">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <Vote className="w-8 h-8 text-blue-600" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-gray-900">Cast Your Vote</h1>
                    <p className="text-gray-500">Please select your preferred candidates below</p>
                </div>

                {positions.map((position) => {
                    const positionCandidates = candidatesByPosition[position];
                    const isPresident = position === 'President';
                    const isUnopposed = positionCandidates.length === 1;

                    return (
                        <motion.div key={position} variants={itemVariants}>
                            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
                                <CardHeader className="bg-gray-50/50 border-b pb-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            {position}
                                            {votes[position] && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                        </CardTitle>
                                    </div>
                                    <CardDescription>
                                        {isPresident || !isUnopposed ? 'Select one candidate' : 'Do you approve this candidate?'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {isPresident || !isUnopposed ? (
                                        <RadioGroup
                                            onValueChange={(value) => handleVoteChange(position, value)}
                                            value={votes[position]?.candidateId}
                                            className="space-y-4"
                                        >
                                            {positionCandidates.map((candidate) => (
                                                <div
                                                    key={candidate._id}
                                                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer ${votes[position]?.candidateId === candidate._id
                                                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                                        : 'hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => !submitting && handleVoteChange(position, candidate._id)}
                                                >
                                                    <RadioGroupItem value={candidate._id} id={candidate._id} />
                                                    <Label htmlFor={candidate._id} className="flex-grow cursor-pointer font-medium text-lg">
                                                        {candidate.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    ) : (
                                        // Unopposed non-president candidate: Yes/No
                                        <div className="flex flex-col gap-4 items-center justify-between p-4 border rounded-lg bg-white">
                                            <span className="font-semibold text-lg">{positionCandidates[0].name}</span>
                                            <RadioGroup
                                                onValueChange={(value) => handleYesNoChange(position, positionCandidates[0]._id, value)}
                                                value={votes[position]?.type}
                                                className="flex space-x-6"
                                            >
                                                <div className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors ${votes[position]?.type === 'yes' ? 'bg-green-50 border-green-500' : 'hover:bg-gray-50'
                                                    }`}>
                                                    <RadioGroupItem value="yes" id={`${positionCandidates[0]._id}-yes`} />
                                                    <Label htmlFor={`${positionCandidates[0]._id}-yes`} className="cursor-pointer text-green-600 font-bold flex items-center gap-1">
                                                        Yes
                                                    </Label>
                                                </div>
                                                <div className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors ${votes[position]?.type === 'no' ? 'bg-red-50 border-red-500' : 'hover:bg-gray-50'
                                                    }`}>
                                                    <RadioGroupItem value="no" id={`${positionCandidates[0]._id}-no`} />
                                                    <Label htmlFor={`${positionCandidates[0]._id}-no`} className="cursor-pointer text-red-600 font-bold flex items-center gap-1">
                                                        No
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}

                <motion.div variants={itemVariants} className="pt-6 pb-12 text-center">
                    <Button
                        onClick={handleSubmit}
                        size="lg"
                        className="w-full text-center max-w-md text-lg h-14 shadow-lg hover:shadow-xl transition-all"
                        disabled={submitting || Object.keys(votes).length !== positions.length}
                    >
                        {submitting ? (
                            'Submitting...'
                        ) : (
                            <>
                                Submit Vote <Send className="ml-2 w-5 h-5" />
                            </>
                        )}
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
}
