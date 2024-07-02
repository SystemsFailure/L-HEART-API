import Redis, { RedisClientType } from "redis";

class RedisService {
    private static instance: RedisService;
    private client: RedisClientType;

    private constructor() {
        this.client = Redis.createClient();

        this.client.on("connect", () => {
            console.log("Connected to Redis");
        });

        this.client.on("error", (err: Error) => {
            console.error("Error connecting to Redis:", err);
        });
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    public publish(channel: string, message: string): void {
        this.client.publish(channel, message);
    }

    public subscribe(channel: string, callback: (channel: string, message: string) => void): void {
        this.client.subscribe(channel, (err, _channel) => {
            if (err) {
                console.error(`Error subscribing to channel ${channel}:`, err);
                return;
            }
            console.log(`Subscribed to channel ${channel}`);
        });

        this.client.on("message", (subChannel, msg) => {
            if (subChannel === channel) {
                callback(subChannel, msg);
            }
        });
    }

    public unsubscribe(channel: string): void {
        this.client.unsubscribe(channel, (err, _channel) => {
            if (err) {
                console.error(`Error unsubscribing from channel ${channel}:`, err);
                return;
            }
            console.log(`Unsubscribed from channel ${channel}`);
        });
    }
}

export default RedisService.getInstance();
