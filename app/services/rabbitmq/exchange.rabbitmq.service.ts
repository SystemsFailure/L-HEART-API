import * as amqp from 'amqplib';

export default class RabbitMQExchangeService {
    private connection: amqp.Connection | undefined;
    private channel: amqp.Channel | undefined;
    private exchangeName: string;
    private config: any;

    constructor(config: any) {
        // Устанавливаем имя обменника по умолчанию, если не передано другое
        this.exchangeName = process.env.EXCHANGE_NAME || 'default_exchange';
        this.config = config;
    }

    // Устанавливаем соединение с RabbitMQ и создаем канал
    async connect(): Promise<void> {
        this.connection = await amqp.connect(this.config.RABBITMQ_URL);
        this.channel = await this.connection.createChannel();
        // Создаем обменник типа "fanout" с возможностью автоматического удаления
        await this.channel.assertExchange(this.exchangeName, 'fanout', { durable: false });
    }

    // Публикуем сообщение в обменник
    async publishMessageToExchange(exchange: string, message: string): Promise<void> {
        this.channel?.publish(exchange, '', Buffer.from(message));
    }

    // Создаем очередь и возвращаем ее имя
    async createQueue(queueName: string): Promise<string> {
        const assertQueue = await this.channel?.assertQueue(queueName, { exclusive: true });
        return assertQueue!.queue;
    }

    // Привязываем очередь к обменнику
    async bindQueueToExchange(queue: string, exchange: string): Promise<void> {
        await this.channel?.bindQueue(queue, exchange, '');
    }

    // Подписываемся на получение сообщений из очереди и вызываем обработчик для каждого сообщения
    async consumeFromQueue(queue: string, callback: (message: string) => void): Promise<void> {
        await this.channel?.consume(queue, (message) => {
            if (message !== null) {
                callback(message.content.toString());
            }
        }, { noAck: true });
    }

    // Отвязываем очередь от обменника
    async unbindQueueFromExchange(queue: string, exchange: string): Promise<void> {
        await this.channel?.unbindQueue(queue, exchange, '');
    }

    // Удаляем очередь
    async deleteQueue(queue: string): Promise<void> {
        await this.channel?.deleteQueue(queue);
    }

    // Закрываем соединение с RabbitMQ
    async closeConnection(): Promise<void> {
        await this.channel?.close();
        await this.connection?.close();
    }
}