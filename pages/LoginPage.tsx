import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { UserType } from '../types';

// Catppuccin Mocha Colors
const catppuccin = {
    base: '#1E1E2E',
    mauve: '#CBA6F7',
    blue: '#89B4FA',
    text: '#CDD6F4',
    surface0: '#313244',
    green: '#A6E3A1',
    overlay1: '#6c7086',
};

const LoginPage: React.FC = () => {
    const { login, register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // For registration
    const [isRegistering, setIsRegistering] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor, introduce tu correo y contraseña.');
            return;
        }
        try {
            await login(email, password);
        } catch (error) {
            Alert.alert('Error de inicio de sesión', error.message);
        }
    };

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Por favor, completa todos los campos para registrarte.');
            return;
        }
        try {
            // For simplicity, new registrations are set as PATIENT.
            // This could be expanded with a role selector.
            await register(name, email, password, UserType.PATIENT);
        } catch (error) {
            Alert.alert('Error de registro', error.message);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>PILDHORA</Text>
                    <Text style={styles.subtitle}>Tranquilidad conectada.</Text>
                </View>

                <View style={styles.formContainer}>
                    {isRegistering && (
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre completo"
                            placeholderTextColor={catppuccin.overlay1}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    )}
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        placeholderTextColor={catppuccin.overlay1}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        placeholderTextColor={catppuccin.overlay1}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        onPress={isRegistering ? handleRegister : handleLogin}
                        style={[styles.button, styles.primaryButton]}
                    >
                        <Text style={styles.buttonText}>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
                        <Text style={styles.toggleText}>
                            {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                        </Text>
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
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
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
    formContainer: {
        width: '100%',
    },
    input: {
        backgroundColor: catppuccin.surface0,
        color: catppuccin.text,
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    button: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    primaryButton: {
        backgroundColor: catppuccin.blue,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: catppuccin.base,
    },
    toggleText: {
        color: catppuccin.mauve,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default LoginPage;