import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure the notification handler for when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Requests permissions for notifications.
 * This should be called before trying to schedule any notifications.
 */
export const requestNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
};

/**
 * Schedules a notification for a medication dose.
 * @param medicationName The name of the medication.
 * @param time The time to schedule the notification (HH:MM).
 */
export const scheduleDoseNotification = async (medicationName: string, time: string) => {
    const [hour, minute] = time.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "💊 Hora de tu medicación!",
            body: `No olvides tomar tu dosis de ${medicationName}.`,
            sound: 'default',
        },
        trigger: {
            hour,
            minute,
            repeats: true, // Repeat this notification daily at the same time
        },
    });
    console.log(`Notification scheduled for ${medicationName} at ${time}`);
};

/**
 * Cancels all scheduled notifications.
 */
export const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All scheduled notifications have been cancelled.');
};