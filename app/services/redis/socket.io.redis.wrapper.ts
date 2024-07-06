import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import RedisClient from './redis.client.js';

class SocketIORedisWrapper {
  private io: Server;  // Сервер Socket.IO для управления сокетами
  private redisSubscriber: Redis.Redis;  // Подписчик Redis для получения сообщений
  private redisPublisher: Redis.Redis;  // Издатель Redis для отправки сообщений

  // Конструктор, инициализирующий сервер и подключения к Redis
  constructor(io: Server) {
    this.io = io;

    // Получаем экземпляры подписчика и издателя Redis
    this.redisSubscriber = RedisClient.getInstance();
    this.redisPublisher = RedisClient.getInstance();

    // Обработчик сообщений из Redis для канала 'socketio'
    this.redisSubscriber.on('message', (channel, message) => {
      if (channel === 'socketio') {
        const { event, data } = JSON.parse(message);
        this.io.emit(event, data);  // Отправляем сообщение через Socket.IO всем подключенным клиентам
      }
    });

    this.redisSubscriber.subscribe('socketio');  // Подписываемся на канал 'socketio' в Redis
  }

  // Публикация сообщения в Redis на канал 'socketio'
  public publish(event: string, data: any): void {
    const message = JSON.stringify({ event, data });
    this.redisPublisher.publish('socketio', message);
  }

  // Подписка на событие в Socket.IO и Redis для конкретного сокета
  public subscribe(socket: Socket, event: string): void {
    this.redisSubscriber.subscribe(event);  // Подписываемся на канал в Redis
    this.io.on(event, (data: any) => {
      socket.emit(event, data);  // Отправляем событие клиенту через сокет
    });
  }

  // Отписка от канала в Redis
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
