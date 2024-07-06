import { Redis, RedisOptions } from 'ioredis';

class RedisService {
    private static instance: RedisService;  // Одиночка, чтобы создать единственный экземпляр сервиса
    private client: Redis;  // Клиент Redis для взаимодействия с сервером

    // Приватный конструктор, инициализирующий клиент Redis
    private constructor(options: RedisOptions) {
        this.client = new Redis(options);  // Создаем новый клиент Redis с переданными опциями

        // Обработчики событий подключения и ошибок
        this.client.on('connect', () => {
            console.log('Connected to Redis');
        });

        this.client.on('error', (err: Error) => {
            console.error('Error connecting to Redis:', err);  // Выводим ошибку подключения к Redis
        });
    }

    // Статический метод для получения единственного экземпляра сервиса Redis
    public static getInstance(options: RedisOptions): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService(options);  // Создаем новый экземпляр, если его нет
        }
        return RedisService.instance;  // Возвращаем существующий экземпляр
    }

    // Асинхронно публикует сообщение в заданный канал
    public async publish(channel: string, message: string): Promise<void> {
        await this.client.publish(channel, message);  // Выполняем публикацию сообщения в Redis
    }

    // Подписывается на сообщения в заданном канале и вызывает колбэк при получении сообщения
    public subscribe(channel: string, callback: (channel: string, message: string) => void): void {
        this.client.subscribe(channel, (err, count) => {
            if (err) {
                console.error(`Error subscribing to channel ${channel}:`, err, count);  // Выводим ошибку подписки
                return;
            }
            console.log(`Subscribed to channel ${channel}`);  // Выводим сообщение о успешной подписке
        });

        this.client.on('message', (subChannel, msg) => {
            if (subChannel === channel) {
                callback(subChannel, msg);  // Вызываем колбэк при получении сообщения в подписанном канале
            }
        });
    }

    // Отписывается от сообщений в заданном канале
    public unsubscribe(channel: string): void {
        this.client.unsubscribe(channel, (err, count) => {
            if (err) {
                console.error(`Error unsubscribing from channel ${channel}:`, err, count);  // Выводим ошибку отписки
                return;
            }
            console.log(`Unsubscribed from channel ${channel}`);  // Выводим сообщение об успешной отписке
        });
    }
}

// Экспорт единственного экземпляра сервиса Redis, созданного с заданными параметрами
export default RedisService.getInstance({
    host: 'localhost',
    port: 6379,
});
