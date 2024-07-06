// import * as twilio from 'twilio';

// // Создаем класс для работы со звонками и сообщениями для регионов Запада и Европы через Twilio сервис, возможно работает и с регионом Россия
// export default class CommunicationService {
//     private client: twilio.Twilio;

//     constructor(accountSid: string, authToken: string) {
//         this.client = twilio(accountSid, authToken);
//     }

//     // Метод для отправки SMS
//     public sendSMS(from: string, to: string, body: string): Promise<twilio.Twilio.RestApi> {
//         return this.client.messages.create({
//             body: body,
//             from: from,
//             to: to
//         });
//     }

//     // Метод для совершения звонка
//     public makeCall(from: string, to: string, url: string): Promise<twilio.Twilio.RestApi> {
//         return this.client.calls.create({
//             url: url,
//             from: from,
//             to: to
//         });
//     }
// }


// // Пример использования сервиса
// const communicationService = new CommunicationService('YOUR_ACCOUNT_SID', 'YOUR_AUTH_TOKEN');

// communicationService.sendSMS('+1234567890', '+0987654321', 'Hello, this is a test SMS!')
//     .then(message => console.log('SMS sent:', message.sid))
//     .catch(error => console.error('Error sending SMS:', error));

// communicationService.makeCall('+1234567890', '+0987654321', 'http://demo.twilio.com/docs/voice.xml')
//     .then(call => console.log('Call initiated:', call.sid))
//     .catch(error => console.error('Error making call:', error));