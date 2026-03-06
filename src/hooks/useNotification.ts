import { useEffect, useState } from 'react';

export function useNotification() {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notification');
            return;
        }
        setPermission(Notification.permission);
    }, []);

    const requestPermission = async () => {
        if (!('Notification' in window)) return 'denied';

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    };

    const sendNotification = (title: string, options?: NotificationOptions) => {
        if (permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                ...options
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            return notification;
        }
        return null;
    };

    return { permission, requestPermission, sendNotification };
}
