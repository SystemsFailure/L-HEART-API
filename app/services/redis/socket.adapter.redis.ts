import { Server, Socket } from "socket.io";
import RedisService from "./redis.service.js";

class SocketService {
    private static instance: SocketService;  // Одиночка, чтобы создать единственный экземпляр сервиса сокетов
    private io: Server;  // Сервер Socket.IO для обработки подключений

    // Приватный конструктор, инициализирующий сервер Socket.IO
    private constructor(server: any) {
        this.io = new Server(server);  // Создаем новый сервер Socket.IO на переданном сервере

        // Обработчик события подключения нового клиента
        this.io.on("connection", (socket: Socket) => {
            console.log("A user connected");  // Выводим сообщение о подключении нового пользователя

            // Обработчик события отключения клиента
            socket.on("disconnect", () => {
                console.log("User disconnected");
            });

            // Подписываемся на канал Redis "chat" и отправляем сообщения клиенту
            RedisService.subscribe("chat", (channel: any, message: any) => {
                console.log(`Received message on channel ${channel}: ${message}`);
                socket.emit("chatMessage", message);  // Отправляем сообщение клиенту через сокет
            });
        });
    }

    // Статический метод для получения единственного экземпляра сервиса сокетов
    public static getInstance(server: any): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService(server);  // Создаем новый экземпляр, если его нет
        }
        return SocketService.instance;  // Возвращаем существующий экземпляр
    }

    // Присоединение клиента к комнате по идентификатору сокета и имени комнаты
    public joinRoom(socketId: string, roomName: string): void {
        this.io.sockets.sockets.get(socketId)?.join(roomName);
    }

    // Отсоединение клиента от комнаты по идентификатору сокета и имени комнаты
    public leaveRoom(socketId: string, roomName: string): void {
        this.io.sockets.sockets.get(socketId)?.leave(roomName);
    }

    // Отправка сообщения в комнату по имени комнаты и имени события
    public sendMessageToRoom(roomName: string, eventName: string, data: any): void {
        this.io.to(roomName).emit(eventName, data);
    }

    // Отправка сообщения конкретному клиенту по его идентификатору сокета и имени события
    public sendMessageToSocket(socketId: string, eventName: string, data: any): void {
        this.io.to(socketId).emit(eventName, data);
    }

    // Установка обработчика события на сервере сокетов
    public onEvent(eventName: string, callback: Function): void {
        this.io.on(eventName, (socket: Socket, data: any) => {
            callback(socket, data);
        });
    }

    // Отключение клиента по его идентификатору сокета
    public disconnectSocket(socketId: string): void {
        this.io.sockets.sockets.get(socketId)?.disconnect();
    }

    // Публикация сообщения в Redis по заданному каналу
    public publishToRedis(channel: string, message: string): void {
        RedisService.publish(channel, message);
    }

    // Подписка на сообщения из Redis по заданному каналу с вызовом колбэка
    public subscribeToRedis(channel: string, callback: (channel: string, message: string) => void): void {
        RedisService.subscribe(channel, callback);
    }

    // Отписка от сообщений из Redis по заданному каналу
    public unsubscribeFromRedis(channel: string): void {
        RedisService.unsubscribe(channel);
    }
}

// Экспорт единственного экземпляра сервиса сокетов, созданного с заданными параметрами
export default SocketService.getInstance;
