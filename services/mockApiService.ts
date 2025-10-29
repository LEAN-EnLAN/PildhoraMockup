
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

interface MockData {
    medications: Medication[];
    intakeHistory: IntakeRecord[];
    tasks: Task[];
    notifications: Notification[];
    notificationPreferences: NotificationPreferences;
}

const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};


// --- INITIAL MOCK DATA ---
const getInitialData = (): MockData => {
    const today = getStartOfToday();
    
    const initialMedications: Medication[] = [
        { id: 'med-01', patientId: PATIENT_ID, name: 'Lisinopril', dosage: '10mg', stock: 50, refillReminderStockLevel: 10, compartment: 1, refillDueDate: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000), schedule: { frequency: 'Diariamente', times: ['08:00'] } },
        { id: 'med-02', patientId: PATIENT_ID, name: 'Metformin', dosage: '500mg', stock: 80, refillReminderStockLevel: 20, compartment: 2, refillDueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), schedule: { frequency: 'Diariamente', times: ['14:00', '20:00'] } },
        { id: 'med-03', patientId: PATIENT_ID, name: 'Simvastatin', dosage: '20mg', stock: 25, refillReminderStockLevel: 5, compartment: 3, refillDueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), schedule: { frequency: 'Diariamente', times: ['20:00'] } },
        { id: 'med-04', patientId: PATIENT_ID, name: 'Aspirina', dosage: '81mg', stock: 15, refillReminderStockLevel: 7, compartment: 1, refillDueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), schedule: { frequency: 'Diariamente', times: ['08:00'] } },
    ];
    
    // Dynamically generate today's intake records from medication schedules
    const intakeForToday: IntakeRecord[] = [];
    initialMedications.forEach(med => {
        if (med.schedule && med.schedule.frequency === 'Diariamente') {
            med.schedule.times.forEach(time => {
                const [hour, minute] = time.split(':').map(Number);
                const scheduledTime = new Date(today);
                scheduledTime.setHours(hour, minute);

                // Simulate some past statuses for demo purposes
                let status = IntakeStatus.PENDING;
                const now = new Date();
                if (scheduledTime < now) {
                    // Simple logic to make some past doses missed
                    if (med.name === 'Metformin' && hour === 14) {
                        status = IntakeStatus.MISSED;
                    } else {
                        status = IntakeStatus.TAKEN;
                    }
                }

                intakeForToday.push({
                    id: `intake-${med.id}-${time}`,
                    patientId: PATIENT_ID,
                    medicationId: med.id,
                    medicationName: med.name,
                    dosage: med.dosage,
                    scheduledTime,
                    status,
                    compartment: med.compartment,
                    method: status === IntakeStatus.TAKEN ? 'manual' : undefined,
                });
            });
        }
    });

    return {
        medications: initialMedications,
        intakeHistory: intakeForToday,
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

// --- HELPER to regenerate daily intakes ---
const regenerateDailyIntakes = () => {
    const today = getStartOfToday();
    // Keep history from other days untouched
    const otherDaysIntake = MOCK_DATA.intakeHistory.filter(r => r.scheduledTime.toDateString() !== today.toDateString());
    
    const intakeForToday: IntakeRecord[] = [];
    
    const dayAbbrs = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const todayDayAbbr = dayAbbrs[today.getDay()];

    MOCK_DATA.medications.forEach(med => {
        let shouldGenerate = false;
        if (med.schedule?.frequency === 'Diariamente') {
            shouldGenerate = true;
        } else if (med.schedule?.frequency === 'Días específicos de la semana') {
            if (med.schedule.days?.includes(todayDayAbbr as any)) {
                shouldGenerate = true;
            }
        }
        // Other frequencies like 'Cada 8 horas' are not handled by this daily generator for simplicity.

        if (shouldGenerate && med.schedule?.times) {
            med.schedule.times.forEach(time => {
                const [hour, minute] = time.split(':').map(Number);
                const scheduledTime = new Date(today);
                scheduledTime.setHours(hour, minute);

                // Preserve existing status if it exists and is not PENDING
                const existingRecord = MOCK_DATA.intakeHistory.find(
                    r => r.medicationId === med.id && r.scheduledTime.getTime() === scheduledTime.getTime()
                );
                
                let status = IntakeStatus.PENDING;
                let method = undefined;
                if (existingRecord && existingRecord.status !== IntakeStatus.PENDING) {
                    status = existingRecord.status;
                    method = existingRecord.method;
                }

                intakeForToday.push({
                    id: `intake-${med.id}-${time}`,
                    patientId: PATIENT_ID,
                    medicationId: med.id,
                    medicationName: med.name,
                    dosage: med.dosage,
                    scheduledTime,
                    status,
                    compartment: med.compartment,
                    method,
                });
            });
        }
    });

    MOCK_DATA.intakeHistory = [...otherDaysIntake, ...intakeForToday];
};

// Fetch Functions
export const fetchMedications = (patientId: string) => simulateApiCall<Medication[]>(MOCK_DATA.medications.filter(m => m.patientId === patientId));

export const fetchIntakeHistory = (patientId: string): Promise<IntakeRecord[]> => {
    // Before fetching, ensure today's schedule is up-to-date
    regenerateDailyIntakes();
    saveDataToLocalStorage();
    const history = MOCK_DATA.intakeHistory.filter(r => r.patientId === patientId);
    return simulateApiCall<IntakeRecord[]>(history);
};

export const fetchTasks = (caregiverId: string) => simulateApiCall<Task[]>(MOCK_DATA.tasks.filter(t => t.caregiverId === caregiverId));
export const fetchNotifications = () => simulateApiCall<Notification[]>(MOCK_DATA.notifications.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
export const fetchNotificationPreferences = () => simulateApiCall<NotificationPreferences>(MOCK_DATA.notificationPreferences);

// Update Functions
export const updateIntakeRecord = async (record: IntakeRecord): Promise<IntakeRecord> => {
    MOCK_DATA.intakeHistory = MOCK_DATA.intakeHistory.map(r => r.id === record.id ? record : r);
    saveDataToLocalStorage();
    return simulateApiCall<IntakeRecord>(record);
};

export const saveMedication = async (med: Omit<Medication, 'id'> | Medication): Promise<Medication> => {
    let savedMed: Medication;
    if ('id' in med) {
        // Update
        MOCK_DATA.medications = MOCK_DATA.medications.map(m => m.id === med.id ? med as Medication : m);
        savedMed = med as Medication;
    } else {
        // Create
        const newMed: Medication = { ...(med as Omit<Medication, 'id'>), id: `med-${Date.now()}` };
        MOCK_DATA.medications.push(newMed);
        savedMed = newMed;
    }
    // After saving, regenerate today's intake records to reflect the changes
    regenerateDailyIntakes();
    saveDataToLocalStorage();
    return simulateApiCall<Medication>(savedMed);
};

export const removeMedication = async (medId: string): Promise<{ id: string }> => {
    MOCK_DATA.medications = MOCK_DATA.medications.filter(m => m.id !== medId);
    // After deleting, regenerate today's intake records to remove the deleted med's schedule
    regenerateDailyIntakes();
    saveDataToLocalStorage();
    return simulateApiCall({ id: medId });
};

export const saveTask = async (task: Omit<Task, 'id' | 'status'> | Task): Promise<Task> => {
    let savedTask: Task;
    if ('id' in task) {
        // Update
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