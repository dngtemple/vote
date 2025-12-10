import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, User, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

export default function Login() {
    const [fullname, setFullname] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const loginPromise = async () => {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullname, accessCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('voter', JSON.stringify(data.voter));
            navigate('/vote');
            return 'Login successful! Welcome to the voting booth.';
        };

        toast.promise(loginPromise(), {
            loading: 'Verifying credentials...',
            success: (msg) => msg,
            error: (err) => err.message,
        })
            .finally(() => setLoading(false));
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="shadow-xl border-t-4 border-t-primary">
                    <CardHeader className="space-y-1 text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="bg-primary/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                        >
                            <LogIn className="w-8 h-8 text-primary" />
                        </motion.div>
                        <CardTitle className="text-3xl font-extrabold text-gray-900">Voter Login</CardTitle>
                        <CardDescription className="text-base text-gray-600">
                            Secure access to the electronic voting system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="fullname" className="text-gray-700 font-medium">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="fullname"
                                        type="text"
                                        placeholder="Enter your registered name"
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                        required
                                        className="pl-10 h-11 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accessCode" className="text-gray-700 font-medium">Access Code</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="accessCode"
                                        type="password"
                                        placeholder="••••••••"
                                        value={accessCode}
                                        onChange={(e) => setAccessCode(e.target.value)}
                                        required
                                        className="pl-10 h-11 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <div className="text-center mt-6 text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Electronic Voting System
                </div>
            </motion.div>
        </div>
    );
}
