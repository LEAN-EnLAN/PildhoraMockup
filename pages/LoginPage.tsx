import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserType } from '../types';

// Catppuccin Mocha Colors
const catppuccin = {
    base: '#1E1E2E',
    mauve: '#CBA6F7',
    blue: '#89B4FA',
    text: '#CDD6F4',
    surface0: '#313244',
    green: '#A6E3A1', // For patient button
};

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const { clearData } = useData();

    // The navigation is now handled by the AppNavigator based on the user state
    const handleLogin = (userType: UserType) => {
        clearData(); // Clear any stale data before logging in
        login(userType);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>PILDHORA</Text>
                    <Text style={styles.subtitle}>Tranquilidad conectada.</Text>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={() => handleLogin(UserType.PATIENT)}
                        style={[styles.button, styles.patientButton]}
                    >
                        <Text style={styles.buttonText}>Soy Paciente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleLogin(UserType.CAREGIVER)}
                        style={[styles.button, styles.caregiverButton]}
                    >
                        <Text style={styles.buttonText}>Soy Cuidador</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: catppuccin.base,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: catppuccin.mauve,
    },
    subtitle: {
        fontSize: 18,
        color: catppuccin.text,
        marginTop: 8,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 400,
    },
    button: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16, // rounded-2xl
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    patientButton: {
        backgroundColor: catppuccin.green,
    },
    caregiverButton: {
        backgroundColor: catppuccin.blue,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: '600',
        color: catppuccin.base,
    },
});

export default LoginPage;