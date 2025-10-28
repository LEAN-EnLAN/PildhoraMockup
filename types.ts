
export enum UserType {
    PATIENT = 'patient',
    CAREGIVER = 'caregiver',
}

export interface User {
    id: string;
    name: string;
    email: string;
    userType: UserType;
    profileData?: {
        patientId?: string;
    };
}

export enum IntakeStatus {
    PENDING = 'PENDING',
    TAKEN = 'TAKEN',
    MISSED = 'MISSED',
}

export interface IntakeRecord {
    id: string;
    patientId: string;
    medicationId: string;
    medicationName: string;
    dosage: string;
    scheduledTime: Date;
    status: IntakeStatus;
    compartment: number;
    method?: 'manual' | 'bluetooth';
}

export interface Medication {
    id: string;
    patientId: string;
    name: string;
    dosage: string;
    stock: number;
    refillReminderStockLevel: number;
    compartment: number;
    refillDueDate: string | Date;
    schedule?: {
        frequency: 'Daily' | 'Weekly' | 'As needed';
        times: string[]; // e.g., ["08:00", "20:00"]
    };
}

export interface Notification {
    id: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

export interface NotificationPreferences {
    missedDose: boolean;
    doseTaken: boolean;
    lowStock: boolean;
}

export enum SyncStatus {
    UP_TO_DATE = 'UP_TO_DATE',
    SYNCING = 'SYNCING',
    OFFLINE = 'OFFLINE',
}

export enum TaskStatus {
    TODO = 'TODO',
    DONE = 'DONE',
}

export interface Task {
    id: string;
    caregiverId: string;
    title: string;
    description: string;
    dueDate: Date | string;
    status: TaskStatus;
}

// --- New Device-related types ---

export enum ScanStatus {
    IDLE = 'IDLE',
    SCANNING = 'SCANNING',
    FINISHED = 'FINISHED',
}

export interface PillboxDevice {
    id: string;
    name: string;
}

export interface PillboxDeviceState {
    isConnected: boolean;
    batteryLevel: number;
    device: PillboxDevice | null;
    compartments: { id: number; isOpen: boolean }[];
}