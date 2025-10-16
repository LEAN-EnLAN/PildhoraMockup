import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Open a database on native platforms; skip on web where expo-sqlite isn't available.
let db: any = null;
try {
  if (Platform.OS !== 'web' && typeof (SQLite as any).openDatabase === 'function') {
    db = SQLite.openDatabase('pildhora.db');
  }
} catch (e) {
  console.warn('SQLite not available, skipping DB init on this platform:', e);
}

/**
 * Initializes the database, creating the necessary tables if they don't exist.
 * This function should be called once when the application starts.
 */
export const initDatabase = () => {
    if (!db) {
        console.warn('Database unavailable on web; skipping schema creation.');
        return;
    }
    db.transaction(tx => {
        // User table
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                userType TEXT NOT NULL,
                password TEXT NOT NULL -- In a real app, this should be a hashed password
            );`,
            [],
            () => console.log('Users table created successfully.'),
            (_, error) => {
                console.error('Error creating users table:', error);
                return false; // Rollback transaction
            }
        );

        // Medications table
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS medications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                name TEXT NOT NULL,
                dose TEXT NOT NULL,
                time TEXT NOT NULL, -- Format: HH:MM
                FOREIGN KEY (userId) REFERENCES users (id)
            );`,
            [],
            () => console.log('Medications table created successfully.'),
            (_, error) => {
                console.error('Error creating medications table:', error);
                return false; // Rollback transaction
            }
        );

        // Adherence table (to track taken doses)
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS adherence (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                medicationId INTEGER NOT NULL,
                takenAt DATETIME NOT NULL,
                status TEXT NOT NULL, -- e.g., 'taken', 'missed'
                FOREIGN KEY (medicationId) REFERENCES medications (id)
            );`,
            [],
            () => console.log('Adherence table created successfully.'),
            (_, error) => {
                console.error('Error creating adherence table:', error);
                return false; // Rollback transaction
            }
        );
    });
};

export default db;