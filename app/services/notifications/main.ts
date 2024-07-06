import { Notification } from "./types.js";

// Класс для управления уведомлениями
export default class NotificationService {
    private notifications: Notification[];

    constructor() {
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

// Пример использования
// const emailNotification = new EmailNotification('example@example.com', 'Hello from Notification Service');
// const smsNotification = new SMSNotification('1234567890', 'Hello from Notification Service');

// const notificationService = new NotificationService();
// notificationService.addNotification(emailNotification);
// notificationService.addNotification(smsNotification);

// notificationService.sendNotifications();