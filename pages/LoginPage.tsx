import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserType } from '../types';
import { useData } from '../context/DataContext';

const LoginPage: React.FC = () => {
    const { login, user } = useAuth();
    const { clearData } = useData();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if user is already logged in
        if (user) {
            navigate(user.userType === UserType.PATIENT ? '/patient' : '/caregiver', { replace: true });
        }
    }, [user, navigate]);

    const handleLogin = (userType: UserType) => {
        clearData(); // Clear any stale data before logging in
        login(userType);
        // The useEffect hook will handle navigation once the user state is updated
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-pildhora-background">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-pildhora-primary">PILDHORA</h1>
                    <p className="mt-2 text-lg text-gray-600">Tranquilidad conectada</p>
                </div>
                <div className="space-y-4">
                    <button
                        onClick={() => handleLogin(UserType.PATIENT)}
                        className="w-full px-4 py-3 text-xl font-semibold text-white transition-transform transform bg-patient-btn rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 active:scale-95"
                    >
                        Soy Paciente
                    </button>
                    <button
                        onClick={() => handleLogin(UserType.CAREGIVER)}
                        className="w-full px-4 py-3 text-xl font-semibold text-white transition-transform transform bg-pildhora-secondary rounded-xl hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95"
                    >
                        Soy Cuidador
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;