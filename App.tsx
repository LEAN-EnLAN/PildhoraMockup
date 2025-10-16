import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { initDatabase } from './services/databaseService';
import { requestNotificationPermissions } from './services/notificationService';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import CaregiverDashboard from './pages/CaregiverDashboard';
import { UserType } from './types';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
    const { user } = useAuth();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                user.userType === UserType.PATIENT ? (
                    <Stack.Screen name="PatientDashboard" component={PatientDashboard} />
                ) : (
                    <Stack.Screen name="CaregiverDashboard" component={CaregiverDashboard} />
                )
            ) : (
                <Stack.Screen name="Login" component={LoginPage} />
            )}
        </Stack.Navigator>
    );
};

const App: React.FC = () => {
    useEffect(() => {
        initDatabase();
        requestNotificationPermissions();
    }, []);

    return (
        <AuthProvider>
            <DataProvider>
                <NavigationContainer>
                    <AppNavigator />
                </NavigationContainer>
            </DataProvider>
        </AuthProvider>
    );
};

export default App;