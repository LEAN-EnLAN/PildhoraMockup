
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

// --- LOCAL STORAGE SETUP ---
const LOCAL_STORAGE_KEY = 'pildhora_data_v1';

// Fix: Add an interface to strongly type the mock data object.
// This ensures consistency with the types defined in types.ts and prevents inference errors.
interface MockData {
    medications: Medication[];
    intakeHistory: IntakeRecord[];
    tasks: Task[];
    notifications: Notification[];
    notificationPreferences: NotificationPreferences;
}

// REFACTOR: Create a function to get the start of the current day dynamically.
// This fixes a bug where 'today' would become stale if the app was used across midnight.
const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};


// --- INITIAL MOCK DATA ---
const getInitialData = (): MockData => {
    const today = getStartOfToday();
    return {
        medications: [
            { id: 'med-01', patientId: PATIENT_ID, name: 'Lisinopril', dosage: '10mg', stock: 50, refillReminderStockLevel: 10, compartment: 1, refillDueDate: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000) },
            { id: 'med-02', patientId: PATIENT_ID, name: 'Metformin', dosage: '500mg', stock: 80, refillReminderStockLevel: 20, compartment: 2, refillDueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) },
            { id: 'med-03', patientId: PATIENT_ID, name: 'Simvastatin', dosage: '20mg', stock: 25, refillReminderStockLevel: 5, compartment: 3, refillDueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000) },
            { id: 'med-04', patientId: PATIENT_ID, name: 'Aspirina', dosage: '81mg', stock: 15, refillReminderStockLevel: 7, compartment: 1, refillDueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000) },
        ],
        intakeHistory: [
            // Morning
            { id: 'intake-01', patientId: PATIENT_ID, medicationId: 'med-01', medicationName: 'Lisinopril', dosage: '10mg', scheduledTime: new Date(today.getTime() + 8 * 60 * 60 * 1000), status: IntakeStatus.TAKEN, compartment: 1, method: 'manual' },
            { id: 'intake-02', patientId: PATIENT_ID, medicationId: 'med-04', medicationName: 'Aspirina', dosage: '81mg', scheduledTime: new Date(today.getTime() + 8 * 60 * 60 * 1000), status: IntakeStatus.TAKEN, compartment: 1, method: 'manual' },
            // Midday
            { id: 'intake-03', patientId: PATIENT_ID, medicationId: 'med-02', medicationName: 'Metformin', dosage: '500mg', scheduledTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), status: IntakeStatus.MISSED, compartment: 2 },
            // Evening
            { id: 'intake-04', patientId: PATIENT_ID, medicationId: 'med-03', medicationName: 'Simvastatin', dosage: '20mg', scheduledTime: new Date(today.getTime() + 20 * 60 * 60 * 1000), status: IntakeStatus.PENDING, compartment: 3 },
            { id: 'intake-05', patientId: PATIENT_ID, medicationId: 'med-02', medicationName: 'Metformin', dosage: '500mg', scheduledTime: new Date(today.getTime() + 20 * 60 * 60 * 1000), status: IntakeStatus.PENDING, compartment: 2 },
        ],
        tasks: [
            { id: 'task-01', caregiverId: CAREGIVER_ID, title: 'Comprar gasas', description: 'En la farmacia de la esquina', dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), status: TaskStatus.TODO },
            { id: 'task-02', caregiverId: CAREGIVER_ID, title: 'Agendar cita con Dr. Smith', description: 'Llamar por la mañana', dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), status: TaskStatus.DONE },
            { id: 'task-03', caregiverId: CAREGIVER_ID, title: 'Revisar presión arterial', description: '', dueDate: today, status: TaskStatus.TODO },
        ],
        notifications: [
            { id: 'notif-01', message: 'Elena Rodríguez ha omitido la toma de Metformina de las 14:00.', timestamp: new Date(today.getTime() + 14 * 60 * 60 * 1000 + 5 * 60 * 1000), read: false },
            { id: 'notif-02', message: 'Elena Rodríguez ha tomado su medicación de las 08:00.', timestamp: new Date(today.getTime() + 8 * 60 * 60 * 1000 + 2 * 60 * 1000), read: true },
        ],
        notificationPreferences: {
            missedDose: true,
            doseTaken: false,
            lowStock: true,
        },
    }
};

let MOCK_DATA: MockData = getInitialData();

// --- DATA PERSISTENCE FUNCTIONS ---
const loadDataFromLocalStorage = () => {
    try {
        const serializedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedData === null) {
            saveDataToLocalStorage(); // Save initial data if nothing is there
            return;
        }
        // It's important to handle date revival when parsing from JSON
        const parsedData = JSON.parse(serializedData, (key, value) => {
            const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
            if (typeof value === 'string' && isoDateRegex.test(value)) {
                return new Date(value);
            }
            return value;
        });
        MOCK_DATA = parsedData;
    } catch (error) {
        console.error("Error loading from localStorage, using initial data.", error);
        MOCK_DATA = getInitialData();
    }
};

const saveDataToLocalStorage = () => {
    try {
        const serializedData = JSON.stringify(MOCK_DATA);
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedData);
    } catch (error) {
        console.error("Error saving to localStorage", error);
    }
};

// Initialize data on module load
loadDataFromLocalStorage();

// --- API SIMULATION ---
const simulateApiCall = <T>(data: T, delay = 150): Promise<T> =>
    new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

// Fetch Functions
export const fetchMedications = (patientId: string) => simulateApiCall<Medication[]>(MOCK_DATA.medications.filter(m => m.patientId === patientId));

export const fetchIntakeHistory = (patientId: string): Promise<IntakeRecord[]> => {
    // Fix: With MOCK_DATA.intakeHistory now correctly typed as IntakeRecord[], this filter operation is type-safe.
    const history = MOCK_DATA.intakeHistory.filter(r => r.patientId === patientId);
    return simulateApiCall<IntakeRecord[]>(history);
};

export const fetchTasks = (caregiverId: string) => simulateApiCall<Task[]>(MOCK_DATA.tasks.filter(t => t.caregiverId === caregiverId));
export const fetchNotifications = () => simulateApiCall<Notification[]>(MOCK_DATA.notifications.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
export const fetchNotificationPreferences = () => simulateApiCall<NotificationPreferences>(MOCK_DATA.notificationPreferences);

// Update Functions
export const updateIntakeRecord = async (record: IntakeRecord): Promise<IntakeRecord> => {
    // Fix: MOCK_DATA.intakeHistory is now IntakeRecord[], so mapping over it and assigning back is type-safe.
    MOCK_DATA.intakeHistory = MOCK_DATA.intakeHistory.map(r => r.id === record.id ? record : r);
    saveDataToLocalStorage();
    return simulateApiCall<IntakeRecord>(record);
};

export const saveMedication = async (med: Omit<Medication, 'id'> | Medication): Promise<Medication> => {
    let savedMed: Medication;
    if ('id' in med) {
        // Update
        // Fix: MOCK_DATA.medications is now Medication[], resolving the type mismatch for `refillDueDate`.
        MOCK_DATA.medications = MOCK_DATA.medications.map(m => m.id === med.id ? med as Medication : m);
        savedMed = med as Medication;
    } else {
        // Create
        const newMed: Medication = { ...(med as Omit<Medication, 'id'>), id: `med-${Date.now()}` };
        MOCK_DATA.medications.push(newMed);
        savedMed = newMed;
    }
    saveDataToLocalStorage();
    return simulateApiCall<Medication>(savedMed);
};

export const removeMedication = async (medId: string): Promise<{ id: string }> => {
    MOCK_DATA.medications = MOCK_DATA.medications.filter(m => m.id !== medId);
    saveDataToLocalStorage();
    return simulateApiCall({ id: medId });
};

export const saveTask = async (task: Omit<Task, 'id' | 'status'> | Task): Promise<Task> => {
    let savedTask: Task;
    if ('id' in task) {
        // Update
        // Fix: MOCK_DATA.tasks is now Task[], resolving the type mismatch for `dueDate`.
        MOCK_DATA.tasks = MOCK_DATA.tasks.map(t => t.id === task.id ? task as Task : t);
        savedTask = task as Task;
    } else {
        // Create
        const newTask: Task = { ...(task as Omit<Task, 'id' | 'status'>), id: `task-${Date.now()}`, status: TaskStatus.TODO };
        MOCK_DATA.tasks.push(newTask);
        savedTask = newTask;
    }
    saveDataToLocalStorage();
    return simulateApiCall<Task>(savedTask);
};

export const removeTask = async (taskId: string): Promise<{ id: string }> => {
    MOCK_DATA.tasks = MOCK_DATA.tasks.filter(t => t.id !== taskId);
    saveDataToLocalStorage();
    return simulateApiCall({ id: taskId });
};

export const saveNotificationPreferences = async (prefs: NotificationPreferences): Promise<NotificationPreferences> => {
    MOCK_DATA.notificationPreferences = prefs;
    saveDataToLocalStorage();
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
    MOCK_DATA.notifications.unshift(newNotif);
    saveDataToLocalStorage();
};
