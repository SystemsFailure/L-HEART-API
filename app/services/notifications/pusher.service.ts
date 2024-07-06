import Pusher from 'pusher';
import { Notification } from './types.js';


// Класс для отправки уведомлений через Pusher
export default class PushNotification implements Notification {
    private pusher: Pusher;
    private channel: string;
    private message: string;

    constructor(pusher: Pusher, channel: string, message: string) {
        this.pusher = pusher;
        this.channel = channel;
        this.message = message;
    }

    // Метод отправки уведомления через Pusher
    sendNotification(): void {
        this.pusher.trigger(this.channel, 'notification', {
            message: this.message
        });
        console.log(`Push notification sent to channel ${this.channel}: ${this.message}`);
    }
}

// Класс для управления уведомлениями через Pusher
export class PushNotificationService {
    private pusher: Pusher;
    private notifications: Notification[];

    constructor(pusher: Pusher) {
        this.pusher = pusher;
        this.notifications = [];
    }

    // Метод для добавления уведомления
    addNotification(notification: Notification): void {
        this.notifications.push(notification);
    }

    // Метод для отправки всех уведомлений
    sendNotifications(): void {
        this.notifications.forEach(notification => {
            notification.sendNotification();
        });
    }
}