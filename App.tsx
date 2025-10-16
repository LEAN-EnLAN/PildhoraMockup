import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { DeviceProvider } from './context/DeviceContext';
import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import CaregiverDashboard from './pages/CaregiverDashboard';
import { UserType } from './types';
import ProtectedRoute from './components/common/ProtectedRoute';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <DeviceProvider>
                <DataProvider>
                    <HashRouter>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route 
                                path="/patient" 
                                element={
                                    <ProtectedRoute allowedUserType={UserType.PATIENT}>
                                        <PatientDashboard />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/caregiver" 
                                element={
                                    <ProtectedRoute allowedUserType={UserType.CAREGIVER}>
                                        <CaregiverDashboard />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route path="/" element={<LoginPage />} />
                        </Routes>
                    </HashRouter>
                </DataProvider>
            </DeviceProvider>
        </AuthProvider>
    );
};

export default App;
