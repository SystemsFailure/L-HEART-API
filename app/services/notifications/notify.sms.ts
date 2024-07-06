import { Notification } from "./types.js";

// Класс для отправки уведомлений по SMS
export default class SMSNotification implements Notification {
    private phoneNumber: string;
    private message: string;

    constructor(phoneNumber: string, message: string) {
        this.phoneNumber = phoneNumber;
        this.message = message;
    }

    // Метод отправки уведомления по SMS
    sendNotification(): void {
        // Здесь был бы код для отправки уведомления по SMS
        console.log(`SMS notification sent to ${this.phoneNumber}: ${this.message}`);
    }
}