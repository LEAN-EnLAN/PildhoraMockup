import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
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
import { useDevice } from './DeviceContext';

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
    const { deviceState, subscribeToCompartmentOpen } = useDevice();
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.SYNCING);

    const [intakeHistory, setIntakeHistory] = useState<IntakeRecord[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(initialPrefs);
    
    // State for device notification throttling
    const [hasSentLowBatteryWarning, setHasSentLowBatteryWarning] = useState(false);
    const prevIsConnected = useRef(deviceState.isConnected);

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

    const updateIntakeStatus = async (record: IntakeRecord, status: IntakeStatus, method: 'manual' | 'bluetooth' = 'manual') => {
        setSyncStatus(SyncStatus.SYNCING);
        try {
            const updatedRecord = await dataRepo.updateIntakeStatus(record, status, method);
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
    
    // Effect for handling automatic intake from device
    useEffect(() => {
        const handleCompartmentOpened = (compartmentId: number) => {
            console.log(`[DataContext] Received compartment open event for: ${compartmentId}`);
            // Find the next pending medication for this specific compartment
            const pendingForCompartment = intakeHistory
                .filter(r => r.status === IntakeStatus.PENDING && r.compartment === compartmentId)
                .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
            
            const nextMedicationInCompartment = pendingForCompartment[0];
            
            if (nextMedicationInCompartment) {
                 const now = new Date();
                 const scheduledTime = nextMedicationInCompartment.scheduledTime;
                 // Check if the opening is within a reasonable window (e.g., from scheduled time up to 1 hour after)
                 if (now >= scheduledTime && (now.getTime() - scheduledTime.getTime()) < 60 * 60 * 1000) { 
                    console.log(`[DataContext] Automatically marking ${nextMedicationInCompartment.medicationName} as taken via Bluetooth.`);
                    updateIntakeStatus(nextMedicationInCompartment, IntakeStatus.TAKEN, 'bluetooth');
                 }
            }
        };
        
        const unsubscribe = subscribeToCompartmentOpen(handleCompartmentOpened);
        
        return () => {
            unsubscribe();
        };
    }, [subscribeToCompartmentOpen, intakeHistory]);
    
    // Effect for handling device status notifications (battery, connection)
    useEffect(() => {
        const LOW_BATTERY_THRESHOLD = 20;

        // Low battery notification logic
        if (deviceState.isConnected && deviceState.batteryLevel < LOW_BATTERY_THRESHOLD && !hasSentLowBatteryWarning) {
            dataRepo.addDeviceNotification('BATTERY_LOW', deviceState.batteryLevel);
            setHasSentLowBatteryWarning(true);
        } else if (deviceState.batteryLevel >= LOW_BATTERY_THRESHOLD) {
            // Reset warning when battery is charged again or on initial connection
            if(hasSentLowBatteryWarning) setHasSentLowBatteryWarning(false);
        }

        // Disconnection notification logic
        if (prevIsConnected.current && !deviceState.isConnected) {
            dataRepo.addDeviceNotification('DISCONNECTED');
        }

        // Update ref for next render
        prevIsConnected.current = deviceState.isConnected;
    }, [deviceState.isConnected, deviceState.batteryLevel, hasSentLowBatteryWarning]);

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
                updateIntakeStatus: (record, status) => updateIntakeStatus(record, status, 'manual'),
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