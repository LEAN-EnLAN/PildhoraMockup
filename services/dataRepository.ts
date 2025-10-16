
import {
    fetchMedications,
    fetchIntakeHistory,
    fetchTasks,
    fetchNotifications,
    fetchNotificationPreferences,
    updateIntakeRecord,
    saveMedication,
    removeMedication,
    saveTask,
    removeTask,
    saveNotificationPreferences,
    addNotification,
} from './mockApiService';
import { IntakeRecord, IntakeStatus, Medication, NotificationPreferences, Task } from '../types';
import { CAREGIVER_ID, PATIENT_ID } from '../constants';

// For simplicity, this repository directly calls the mockApiService.
// In a real app, it might handle caching, offline storage (with localStorageService), etc.

export const getInitialData = async () => {
    const [medications, intakeHistory, tasks, notifications, notificationPreferences] = await Promise.all([
        fetchMedications(PATIENT_ID),
        fetchIntakeHistory(PATIENT_ID),
        fetchTasks(CAREGIVER_ID),
        fetchNotifications(),
        fetchNotificationPreferences(),
    ]);
    return { medications, intakeHistory, tasks, notifications, notificationPreferences };
};

export const updateIntakeStatus = async (record: IntakeRecord, status: IntakeStatus) => {
    const updatedRecord = { ...record, status };
    
    // In a real app, this logic would be on the server.
    // Here we simulate a notification being generated based on notification preferences.
    // NOTE: This is a simplified check. A real app would get prefs from the mock API.
    if (status === IntakeStatus.MISSED) {
        addNotification(`Se ha omitido la toma de ${record.medicationName} de las ${record.scheduledTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.`);
    } else if (status === IntakeStatus.TAKEN) {
         addNotification(`Se ha confirmado la toma de ${record.medicationName} de las ${record.scheduledTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.`);
    }
    
    return updateIntakeRecord(updatedRecord);
};

export const addMedication = (medData: Omit<Medication, 'id' | 'patientId'>) => {
    return saveMedication({ ...medData, patientId: PATIENT_ID });
};

export const updateMedication = (med: Medication) => {
    return saveMedication(med);
};

export const deleteMedication = (medId: string) => {
    return removeMedication(medId);
};

export const addTask = (taskData: Omit<Task, 'id' | 'caregiverId' | 'status'>) => {
    return saveTask({ ...taskData, caregiverId: CAREGIVER_ID });
};

export const updateTask = (task: Task) => {
    return saveTask(task);
};

export const deleteTask = (taskId: string) => {
    return removeTask(taskId);
};

export const updateNotificationPreferences = (prefs: NotificationPreferences) => {
    return saveNotificationPreferences(prefs);
};

// The mock API returns all notifications. The front-end can re-fetch them.
export const getNotifications = () => {
    return fetchNotifications();
}
