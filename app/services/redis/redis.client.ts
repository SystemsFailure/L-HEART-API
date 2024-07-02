import { Redis } from 'ioredis';

class RedisClient {
  private static instance: Redis;

  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: 'localhost',
        port: 6379,
      });
    }
    return RedisClient.instance;
  }
}

export default RedisClient;
