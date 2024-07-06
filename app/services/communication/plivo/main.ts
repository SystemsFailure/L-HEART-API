// import plivo from 'plivo';

// // Создаем класс для работы со звонками и сообщениями
// class CommunicationService {
//     private client: plivo.Client;

//     constructor(authId: string, authToken: string) {
//         this.client = new plivo.Client(authId, authToken);
//     }

//     // Метод для отправки SMS
//     public sendSMS(src: string, dst: string, text: string): Promise<any> {
//         return this.client.messages.create(src, dst, text);
//     }

//     // Метод для совершения звонка
//     public makeCall(from: string, to: string, answerUrl: string): Promise<any> {
//         return this.client.calls.create(from, to, answerUrl);
//     }
// }

// // Пример использования сервиса
// const communicationService = new CommunicationService('YOUR_AUTH_ID', 'YOUR_AUTH_TOKEN');

// communicationService.sendSMS('+1234567890', '+0987654321', 'Hello, this is a test SMS!')
//     .then(response => console.log('SMS sent:', response))
//     .catch(error => console.error('Error sending SMS:', error));

// communicationService.makeCall('+1234567890', '+0987654321', 'http://answer.url')
//     .then(response => console.log('Call initiated:', response))
//     .catch(error => console.error('Error making call:', error));