
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import {
    IntakeRecord,
    IntakeStatus,
    Medication,
    Notification,
    NotificationPreferences,
    SyncStatus,
    Task,
} from '../types';
import * as dataRepo from '../services/dataRepository';
import { useAuth } from './AuthContext';

interface DataContextType {
    intakeHistory: IntakeRecord[];
    medications: Medication[];
    tasks: Task[];
    notifications: Notification[];
    notificationPreferences: NotificationPreferences;
    syncStatus: SyncStatus;
    loading: boolean;
    updateIntakeStatus: (record: IntakeRecord, status: IntakeStatus) => Promise<void>;
    addMedication: (medData: Omit<Medication, 'id' | 'patientId'>) => Promise<void>;
    updateMedication: (med: Medication) => Promise<void>;
    deleteMedication: (medId: string) => Promise<void>;
    addTask: (taskData: Omit<Task, 'id' | 'caregiverId' | 'status'>) => Promise<void>;
    updateTask: (task: Task) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    markNotificationsAsRead: () => void;
    updateNotificationPreferences: (prefs: NotificationPreferences) => Promise<void>;
    clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialPrefs: NotificationPreferences = { missedDose: true, doseTaken: false, lowStock: true };

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.SYNCING);

    const [intakeHistory, setIntakeHistory] = useState<IntakeRecord[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(initialPrefs);

    const fetchData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        };

        setLoading(true);
        setSyncStatus(SyncStatus.SYNCING);
        try {
            const {
                medications: fetchedMeds,
                intakeHistory: fetchedHistory,
                tasks: fetchedTasks,
                notifications: fetchedNotifs,
                notificationPreferences: fetchedPrefs,
            } = await dataRepo.getInitialData();

            setIntakeHistory(fetchedHistory.map(r => ({...r, scheduledTime: new Date(r.scheduledTime)})));
            setMedications(fetchedMeds);
            setTasks(fetchedTasks);
            setNotifications(fetchedNotifs.map(n => ({...n, timestamp: new Date(n.timestamp)})));
            setNotificationPreferences(fetchedPrefs);
            setSyncStatus(SyncStatus.UP_TO_DATE);
        } catch (error) {
            console.error("Failed to fetch data", error);
            setSyncStatus(SyncStatus.OFFLINE);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const clearData = () => {
        setIntakeHistory([]);
        setMedications([]);
        setTasks([]);
        setNotifications([]);
        setNotificationPreferences(initialPrefs);
        setLoading(true);
    };
    
    // --- ACTIONS ---

    const updateIntakeStatus = async (record: IntakeRecord, status: IntakeStatus) => {
        setSyncStatus(SyncStatus.SYNCING);
        try {
            const updatedRecord = await dataRepo.updateIntakeStatus(record, status);
            setIntakeHistory(prev => prev.map(r => (r.id === updatedRecord.id ? { ...updatedRecord, scheduledTime: new Date(updatedRecord.scheduledTime) } : r)));
            
            // Refetch notifications to see new ones
            const newNotifications = await dataRepo.getNotifications();
            setNotifications(newNotifications.map(n => ({...n, timestamp: new Date(n.timestamp)})));
            
            setSyncStatus(SyncStatus.UP_TO_DATE);
        } catch (error) {
            console.error("Failed to update intake status", error);
            setSyncStatus(SyncStatus.OFFLINE);
        }
    };
    
    const addMedication = async (medData: Omit<Medication, 'id' | 'patientId'>) => {
        const newMed = await dataRepo.addMedication(medData);
        setMedications(prev => [...prev, newMed]);
    };

    const updateMedication = async (med: Medication) => {
        const updatedMed = await dataRepo.updateMedication(med);
        setMedications(prev => prev.map(m => (m.id === updatedMed.id ? updatedMed : m)));
    };

    const deleteMedication = async (medId: string) => {
        await dataRepo.deleteMedication(medId);
        setMedications(prev => prev.filter(m => m.id !== medId));
    };
    
     const addTask = async (taskData: Omit<Task, 'id' | 'caregiverId' | 'status'>) => {
        const newTask = await dataRepo.addTask(taskData);
        setTasks(prev => [...prev, newTask]);
    };

    const updateTask = async (task: Task) => {
        const updatedTask = await dataRepo.updateTask(task);
        setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    };

    const deleteTask = async (taskId: string) => {
        await dataRepo.deleteTask(taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };
    
    const markNotificationsAsRead = () => {
        // In a real app, this would be an API call. Here we just update local state.
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const updateNotificationPreferences = async (prefs: NotificationPreferences) => {
        const updatedPrefs = await dataRepo.updateNotificationPreferences(prefs);
        setNotificationPreferences(updatedPrefs);
    };

    return (
        <DataContext.Provider
            value={{
                intakeHistory,
                medications,
                tasks,
                notifications,
                notificationPreferences,
                syncStatus,
                loading,
                updateIntakeStatus,
                addMedication,
                updateMedication,
                deleteMedication,
                addTask,
                updateTask,
                deleteTask,
                markNotificationsAsRead,
                updateNotificationPreferences,
                clearData,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
