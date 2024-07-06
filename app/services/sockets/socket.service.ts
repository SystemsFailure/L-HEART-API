import { Server, Socket } from "socket.io";

export default class SocketService {
    private io: Server;

    constructor(server: any) {
        this.io = new Server(server);
        this.io.on("connection", (socket: Socket) => {
            // console.log("Пользователь подключился");

            socket.on("disconnect", () => {
                // console.log("Пользователь отключился");
            });
        });
    }

    public joinRoom(socketId: string, roomName: string): void {
        // Присоединиться к комнате по ID сокета
        this.io.sockets.sockets.get(socketId)?.join(roomName);
    }

    public leaveRoom(socketId: string, roomName: string): void {
        // Покинуть комнату по ID сокета
        this.io.sockets.sockets.get(socketId)?.leave(roomName);
    }

    public sendMessageToRoom(roomName: string, eventName: string, data: any): void {
        // Отправить сообщение всем сокетам в комнате
        this.io.to(roomName).emit(eventName, data);
    }

    public sendMessageToSocket(socketId: string, eventName: string, data: any): void {
        // Отправить сообщение конкретному сокету
        this.io.to(socketId).emit(eventName, data);
    }

    public onEvent(eventName: string, callback: Function): void {
        // Слушать пользовательские события
        this.io.on(eventName, (socket: Socket, data: any) => {
            callback(socket, data);
        });
    }

    public disconnectSocket(socketId: string): void {
        // Отключить конкретный сокет
        this.io.sockets.sockets.get(socketId)?.disconnect();
    }
}
