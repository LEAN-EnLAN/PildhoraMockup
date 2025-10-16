
// NOTE: This service is not currently used by the data repository but is provided
// to resolve module errors. It can be integrated into the data repository
// to add offline capabilities or persistence across browser sessions.

const LOCAL_STORAGE_KEY = 'pildhora_data';

interface AppData {
    medications: any[];
    intakeHistory: any[];
    tasks: any[];
    notifications: any[];
    notificationPreferences: any;
}

export const saveDataToLocalStorage = (data: AppData) => {
    try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedData);
    } catch (error) {
        console.error("Error saving to localStorage", error);
    }
};

export const loadDataFromLocalStorage = (): AppData | null => {
    try {
        const serializedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedData === null) {
            return null;
        }
        // It's important to handle date revival when parsing from JSON
        return JSON.parse(serializedData, (key, value) => {
            const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
            if (typeof value === 'string' && isoDateRegex.test(value)) {
                 if (key === 'scheduledTime' || key === 'timestamp' || key === 'dueDate' || key === 'refillDueDate') {
                    return new Date(value);
                }
            }
            return value;
        });
    } catch (error) {
        console.error("Error loading from localStorage", error);
        return null;
    }
};

export const clearLocalStorage = () => {
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
        console.error("Error clearing localStorage", error);
    }
};
