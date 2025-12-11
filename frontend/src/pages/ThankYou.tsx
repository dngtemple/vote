import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function ThankYou() {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear sensitive data on mount
        localStorage.removeItem('token');
        localStorage.removeItem('voter');
    }, []);

    const handleLogout = () => {
        navigate('/');
    };
    const Result = () => {
        navigate('/results');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-16 w-16 text-blue-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-900">Thank You!</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Your vote has been successfully cast.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* <Button onClick={Result} className="w-full bg-blue-500" size="lg">
                        View Results
                    </Button> */}
                    <Button onClick={handleLogout} className="w-full" size="lg">
                        Logout
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
