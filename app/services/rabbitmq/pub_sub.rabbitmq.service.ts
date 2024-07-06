import * as amqp from 'amqplib';

// Класс для работы с RabbitMQ Pub/Sub сервисом
export default class RabbitMQPubSubService {
    private connection: amqp.Connection | undefined;
    private channel: amqp.Channel | undefined;
    private exchangeName: string;
    private config: any;

    // Конструктор принимает конфигурацию и устанавливает имя обмена по умолчанию
    constructor(config: any) {
        this.exchangeName = process.env.EXCHANGE_NAME || 'default_exchange';
        this.config = config;
    }

    // Метод для установления соединения с RabbitMQ
    async connect(): Promise<void> {
        this.connection = await amqp.connect(this.config.RABBITMQ_URL);
        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange(this.exchangeName, 'fanout', { durable: false });
    }

    // Метод для публикации сообщения в обмен
    async publishMessage(message: string): Promise<void> {
        this.channel?.publish(this.exchangeName, '', Buffer.from(message));
    }

    // Метод для подписки на сообщения из обмена и вызова callback функции
    async subscribe(callback: (message: string) => void): Promise<void> {
        const assertQueue = await this.channel?.assertQueue('', { exclusive: true });
        await this.channel?.bindQueue(assertQueue!.queue, this.exchangeName, '');
        await this.channel?.consume(assertQueue!.queue, (message) => {
            if (message !== null) {
                callback(message.content.toString());
            }
        }, { noAck: true });
    }

    // Метод для закрытия соединения с RabbitMQ
    async closeConnection(): Promise<void> {
        await this.channel?.close();
        await this.connection?.close();
    }
}