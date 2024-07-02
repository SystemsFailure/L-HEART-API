import { Redis, RedisOptions } from 'ioredis';

class RedisService {
    private static instance: RedisService;
    private client: Redis;

    private constructor(options: RedisOptions) {
        this.client = new Redis(options);

        this.client.on('connect', () => {
            console.log('Connected to Redis');
        });

        this.client.on('error', (err: Error) => {
            console.error('Error connecting to Redis:', err);
        });
    }

    public static getInstance(options: RedisOptions): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService(options);
        }
        return RedisService.instance;
    }

    public async publish(channel: string, message: string): Promise<void> {
        await this.client.publish(channel, message);
    }

    public subscribe(channel: string, callback: (channel: string, message: string) => void): void {
        this.client.subscribe(channel, (err, count) => {
            if (err) {
                console.error(`Error subscribing to channel ${channel}:`, err, count);
                return;
            }
            console.log(`Subscribed to channel ${channel}`);
        });

        this.client.on('message', (subChannel, msg) => {
            if (subChannel === channel) {
                callback(subChannel, msg);
            }
        });
    }

    public unsubscribe(channel: string): void {
        this.client.unsubscribe(channel, (err, count) => {
            if (err) {
                console.error(`Error unsubscribing from channel ${channel}:`, err, count);
                return;
            }
            console.log(`Unsubscribed from channel ${channel}`);
        });
    }
}

export default RedisService.getInstance({
    host: 'localhost',
    port: 6379,
});
