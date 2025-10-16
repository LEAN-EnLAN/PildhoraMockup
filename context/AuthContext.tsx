import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import db from '../services/databaseService';
import { User, UserType } from '../types';

const USER_SESSION_KEY = 'user_session';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email, password) => Promise<void>;
    logout: () => Promise<void>;
    register: (name, email, password, userType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // On app start, try to load user from secure store
        const loadUserFromStorage = async () => {
            try {
                const userId = await SecureStore.getItemAsync(USER_SESSION_KEY);
                if (userId) {
                    db.transaction(tx => {
                        tx.executeSql('SELECT * FROM users WHERE id = ?', [parseInt(userId, 10)], (_, { rows }) => {
                            if (rows.length > 0) {
                                setUser(rows._array[0]);
                            }
                        });
                    });
                }
            } catch (error) {
                console.error('Failed to load user from storage', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    const login = (email, password) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], async (_, { rows }) => {
                    if (rows.length > 0) {
                        const loggedInUser = rows._array[0];
                        setUser(loggedInUser);
                        await SecureStore.setItemAsync(USER_SESSION_KEY, loggedInUser.id.toString());
                        resolve();
                    } else {
                        reject(new Error('Invalid email or password'));
                    }
                }, (_, error) => {
                    reject(error);
                    return false;
                });
            });
        });
    };

    const register = (name, email, password, userType) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql('INSERT INTO users (name, email, password, userType) VALUES (?, ?, ?, ?)', [name, email, password, userType], (_, { insertId }) => {
                    // After registering, log the user in
                    login(email, password).then(resolve).catch(reject);
                }, (_, error) => {
                    reject(error);
                    return false;
                });
            });
        });
    };

    const logout = async () => {
        setUser(null);
        await SecureStore.deleteItemAsync(USER_SESSION_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
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