
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserType } from '../../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedUserType: UserType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedUserType }) => {
    const { user } = useAuth();

    if (!user) {
        // User not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    if (user.userType !== allowedUserType) {
        // User is logged in but does not have the correct role, redirect to login
        // In a real app, you might redirect to an unauthorized page or their own dashboard
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
