import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, UserType } from '../types';
import { PATIENT_ID, CAREGIVER_ID } from '../constants';

interface AuthContextType {
    user: User | null;
    login: (userType: UserType) => void;
    logout: (clearDataCallback: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = useCallback((userType: UserType) => {
        if (userType === UserType.PATIENT) {
            setUser({
                id: PATIENT_ID,
                name: 'Elena Rodríguez',
                email: 'elena.r@example.com',
                userType: UserType.PATIENT
            });
        } else {
            setUser({
                id: CAREGIVER_ID,
                name: 'Carlos Gómez',
                email: 'carlos.g@example.com',
                userType: UserType.CAREGIVER,
                profileData: {
                    patientId: PATIENT_ID
                }
            });
        }
    }, []);

    const logout = useCallback((clearDataCallback: () => void) => {
        setUser(null);
        clearDataCallback();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};