import { Notification } from "./types.js";

// Класс для отправки уведомлений по email
export default class EmailNotification implements Notification {
    private email: string;
    private message: string;

    constructor(email: string, message: string) {
        this.email = email;
        this.message = message;
    }

    // Метод отправки уведомления по email
    sendNotification(): void {
        // Здесь был бы код для отправки уведомления по email
        console.log(`Email notification sent to ${this.email}: ${this.message}`);
    }
}