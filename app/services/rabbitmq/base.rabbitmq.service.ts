import * as amqp from 'amqplib';

export default class RabbitMQService {
    private connection: amqp.Connection | undefined;
    private channel: amqp.Channel | undefined;
    private queueName: string;
    private config: any;

    constructor(config: any) {
        this.queueName = process.env.QUEUE_NAME || 'default_queue';
        this.config = config;
    }

    async connect(): Promise<void> {
        this.checkChannel(this.connect.name);
        this.connection = await amqp.connect(this.config.RABBITMQ_URL);
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(this.queueName);
    }

    async sendMessage(message: string): Promise<void> {
        this.checkChannel(this.sendMessage.name);
        this.channel?.sendToQueue(this.queueName, Buffer.from(message));
    }

    async receiveMessage(): Promise<string | null> {
        this.checkChannel(this.receiveMessage.name);
        const message: false | amqp.GetMessage | undefined = await this.channel?.get(this.queueName);
        if (message) {
            return message.content.toString();
        } else {
            return null;
        }
    }

    async consumeMessage(callback: (message: string) => void): Promise<void> {
        this.checkChannel(this.consumeMessage.name);
        await this.channel?.consume(this.queueName, (message) => {
            if (message !== null) {
                callback(message.content.toString());
                this.channel?.ack(message);
            }
        });
    }

    async closeConnection(): Promise<void> {
        this.checkChannel(this.closeConnection.name);
        await this.channel?.close();
        await this.connection?.close();
    }

    private checkChannel(method: string) {
        if (!this.channel) {
            throw new Error(`Method: [${method}] - this.channel is not define or empty or invalid`);
        }
    }

}