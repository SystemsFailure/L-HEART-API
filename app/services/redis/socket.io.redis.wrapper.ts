import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import RedisClient from './redis.client.js';

class SocketIORedisWrapper {
  private io: Server;
  private redisSubscriber: Redis.Redis;
  private redisPublisher: Redis.Redis;

  constructor(io: Server) {
    this.io = io;
    this.redisSubscriber = RedisClient.getInstance();
    this.redisPublisher = RedisClient.getInstance();

    this.redisSubscriber.on('message', (channel, message) => {
      if (channel === 'socketio') {
        const { event, data } = JSON.parse(message);
        this.io.emit(event, data);
      }
    });

    this.redisSubscriber.subscribe('socketio');
  }

  public publish(event: string, data: any): void {
    const message = JSON.stringify({ event, data });
    this.redisPublisher.publish('socketio', message);
  }

  public subscribe(socket: Socket, event: string): void {
    this.redisSubscriber.subscribe(event);
    this.io.on(event, (data: any) => {
      socket.emit(event, data);
    });
  }

  public unsubscribe(event: string): void {
    this.redisSubscriber.unsubscribe(event);
  }
}

export default SocketIORedisWrapper;


/** 
 * 
 * Пример использования
 * 
*/

// import { createServer } from 'http';
// import { Server } from 'socket.io';
// import SocketIORedisWrapper from './SocketIORedisWrapper';

// const httpServer = createServer();
// const io = new Server(httpServer);

// const socketIORedisWrapper = new SocketIORedisWrapper(io);

// io.on('connection', (socket) => {
//   console.log(`Socket connected: ${socket.id}`);

//   socketIORedisWrapper.subscribe(socket, 'test');

//   socket.on('disconnect', () => {
//     console.log(`Socket disconnected: ${socket.id}`);
//     socketIORedisWrapper.unsubscribe('test');
//   });

//   socket.on('message', (data) => {
//     console.log(`Received message: ${data}`);
//     socketIORedisWrapper.publish('message', data);
//   });
// });

// httpServer.listen(3000, () => {
//   console.log('Socket.IO server listening on port 3000');
// });
