import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import db from '../services/databaseService';
import { User, UserType } from '../types';

const USER_SESSION_KEY = 'user_session';
const USERS_KEY = 'pildhora_users';

type StoredUser = User & { password: string };

const getLocalUsers = (): StoredUser[] => {
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(USERS_KEY) : null;
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const setLocalUsers = (users: StoredUser[]) => {
    try {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
    } catch {
        // ignore storage errors
    }
};

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string, userType: string) => Promise<void>;
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
                    if (Platform.OS === 'web') {
                        const users = getLocalUsers();
                        const found = users.find(u => String(u.id) === String(userId));
                        if (found) {
                            setUser(found);
                        }
                    } else if (db) {
                        db.transaction(tx => {
                            tx.executeSql('SELECT * FROM users WHERE id = ?', [parseInt(userId, 10)], (_, { rows }) => {
                                if (rows.length > 0) {
                                    setUser(rows._array[0]);
                                }
                            });
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to load user from storage', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    const login = (email: string, password: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            if (Platform.OS === 'web') {
                try {
                    const users = getLocalUsers();
                    const found = users.find(u => u.email === email && u.password === password);
                    if (found) {
                        setUser(found);
                        SecureStore.setItemAsync(USER_SESSION_KEY, String(found.id)).then(() => resolve()).catch(reject);
                    } else {
                        reject(new Error('Invalid email or password'));
                    }
                } catch (e) {
                    reject(e);
                }
                return;
            }

            if (!db) {
                reject(new Error('Database not available'));
                return;
            }
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

    const register = (name: string, email: string, password: string, userType: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            if (Platform.OS === 'web') {
                try {
                    const users = getLocalUsers();
                    const newUser: StoredUser = { id: String(Date.now()), name, email, password, userType } as StoredUser;
                    users.push(newUser);
                    setLocalUsers(users);
                    login(email, password).then(() => resolve()).catch(reject);
                } catch (e) {
                    reject(e);
                }
                return;
            }

            if (!db) {
                reject(new Error('Database not available'));
                return;
            }
            db.transaction(tx => {
                tx.executeSql('INSERT INTO users (name, email, password, userType) VALUES (?, ?, ?, ?)', [name, email, password, userType], (_, { insertId }) => {
                    // After registering, log the user in
                    login(email, password).then(() => resolve()).catch(reject);
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