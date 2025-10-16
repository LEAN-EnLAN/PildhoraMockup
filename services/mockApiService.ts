
import {
    IntakeRecord,
    IntakeStatus,
    Medication,
    Notification,
    NotificationPreferences,
    Task,
    TaskStatus,
} from '../types';
import { PATIENT_ID, CAREGIVER_ID } from '../constants';

// --- MOCK DATA ---

const today = new Date();
today.setHours(0, 0, 0, 0);

let MOCK_MEDICATIONS: Medication[] = [
    { id: 'med-01', patientId: PATIENT_ID, name: 'Lisinopril', dosage: '10mg', stock: 50, refillReminderStockLevel: 10, compartment: 1, refillDueDate: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000) },
    { id: 'med-02', patientId: PATIENT_ID, name: 'Metformin', dosage: '500mg', stock: 80, refillReminderStockLevel: 20, compartment: 2, refillDueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) },
    { id: 'med-03', patientId: PATIENT_ID, name: 'Simvastatin', dosage: '20mg', stock: 25, refillReminderStockLevel: 5, compartment: 3, refillDueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000) },
    { id: 'med-04', patientId: PATIENT_ID, name: 'Aspirina', dosage: '81mg', stock: 15, refillReminderStockLevel: 7, compartment: 1, refillDueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000) },
];

let MOCK_INTAKE_HISTORY: IntakeRecord[] = [
    // Morning
    { id: 'intake-01', patientId: PATIENT_ID, medicationId: 'med-01', medicationName: 'Lisinopril', dosage: '10mg', scheduledTime: new Date(today.getTime() + 8 * 60 * 60 * 1000), status: IntakeStatus.TAKEN },
    { id: 'intake-02', patientId: PATIENT_ID, medicationId: 'med-04', medicationName: 'Aspirina', dosage: '81mg', scheduledTime: new Date(today.getTime() + 8 * 60 * 60 * 1000), status: IntakeStatus.TAKEN },
    // Midday
    { id: 'intake-03', patientId: PATIENT_ID, medicationId: 'med-02', medicationName: 'Metformin', dosage: '500mg', scheduledTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), status: IntakeStatus.MISSED },
    // Evening
    { id: 'intake-04', patientId: PATIENT_ID, medicationId: 'med-03', medicationName: 'Simvastatin', dosage: '20mg', scheduledTime: new Date(today.getTime() + 20 * 60 * 60 * 1000), status: IntakeStatus.PENDING },
    { id: 'intake-05', patientId: PATIENT_ID, medicationId: 'med-02', medicationName: 'Metformin', dosage: '500mg', scheduledTime: new Date(today.getTime() + 20 * 60 * 60 * 1000), status: IntakeStatus.PENDING },
];

let MOCK_TASKS: Task[] = [
    { id: 'task-01', caregiverId: CAREGIVER_ID, title: 'Comprar gasas', description: 'En la farmacia de la esquina', dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), status: TaskStatus.TODO },
    { id: 'task-02', caregiverId: CAREGIVER_ID, title: 'Agendar cita con Dr. Smith', description: 'Llamar por la mañana', dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), status: TaskStatus.DONE },
    { id: 'task-03', caregiverId: CAREGIVER_ID, title: 'Revisar presión arterial', description: '', dueDate: new Date(today.getTime()), status: TaskStatus.TODO },
];

let MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'notif-01', message: 'Elena Rodríguez ha omitido la toma de Metformina de las 14:00.', timestamp: new Date(today.getTime() + 14 * 60 * 60 * 1000 + 5 * 60 * 1000), read: false },
    { id: 'notif-02', message: 'Elena Rodríguez ha tomado su medicación de las 08:00.', timestamp: new Date(today.getTime() + 8 * 60 * 60 * 1000 + 2 * 60 * 1000), read: true },
];

let MOCK_NOTIFICATION_PREFS: NotificationPreferences = {
    missedDose: true,
    doseTaken: false,
    lowStock: true,
};

// --- API SIMULATION ---
const simulateApiCall = <T>(data: T, delay = 500): Promise<T> =>
    new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

// Fetch Functions
export const fetchMedications = (patientId: string) => simulateApiCall(MOCK_MEDICATIONS.filter(m => m.patientId === patientId));
export const fetchIntakeHistory = (patientId: string) => {
    // Deserialize date strings
    const historyWithDates = MOCK_INTAKE_HISTORY.filter(r => r.patientId === patientId).map(r => ({ ...r, scheduledTime: new Date(r.scheduledTime) }));
    return simulateApiCall(historyWithDates);
}
export const fetchTasks = (caregiverId: string) => simulateApiCall(MOCK_TASKS.filter(t => t.caregiverId === caregiverId));
export const fetchNotifications = () => simulateApiCall(MOCK_NOTIFICATIONS.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
export const fetchNotificationPreferences = () => simulateApiCall(MOCK_NOTIFICATION_PREFS);

// Update Functions
export const updateIntakeRecord = async (record: IntakeRecord): Promise<IntakeRecord> => {
    MOCK_INTAKE_HISTORY = MOCK_INTAKE_HISTORY.map(r => r.id === record.id ? record : r);
    return simulateApiCall(record);
};

export const saveMedication = async (med: Omit<Medication, 'id'> | Medication): Promise<Medication> => {
    if ('id' in med) {
        // Update
        MOCK_MEDICATIONS = MOCK_MEDICATIONS.map(m => m.id === med.id ? med as Medication : m);
        return simulateApiCall(med as Medication);
    } else {
        // Create
        const newMed: Medication = { ...(med as Omit<Medication, 'id'>), id: `med-${Date.now()}` };
        MOCK_MEDICATIONS.push(newMed);
        return simulateApiCall(newMed);
    }
};

export const removeMedication = async (medId: string): Promise<{ id: string }> => {
    MOCK_MEDICATIONS = MOCK_MEDICATIONS.filter(m => m.id !== medId);
    return simulateApiCall({ id: medId });
};

export const saveTask = async (task: Omit<Task, 'id' | 'status'> | Task): Promise<Task> => {
    if ('id' in task) {
        // Update
        MOCK_TASKS = MOCK_TASKS.map(t => t.id === task.id ? task as Task : t);
        return simulateApiCall(task as Task);
    } else {
        // Create
        const newTask: Task = { ...(task as Omit<Task, 'id' | 'status'>), id: `task-${Date.now()}`, status: TaskStatus.TODO };
        MOCK_TASKS.push(newTask);
        return simulateApiCall(newTask);
    }
};

export const removeTask = async (taskId: string): Promise<{ id: string }> => {
    MOCK_TASKS = MOCK_TASKS.filter(t => t.id !== taskId);
    return simulateApiCall({ id: taskId });
};

export const saveNotificationPreferences = async (prefs: NotificationPreferences): Promise<NotificationPreferences> => {
    MOCK_NOTIFICATION_PREFS = prefs;
    return simulateApiCall(prefs);
};

// This would be a server-side action in a real app
export const addNotification = (message: string) => {
    const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        message,
        timestamp: new Date(),
        read: false
    };
    MOCK_NOTIFICATIONS.unshift(newNotif);
};
