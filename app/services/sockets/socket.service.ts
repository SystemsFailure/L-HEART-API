import { Server, Socket } from "socket.io";

export default class SocketService {
    private io: Server;

    constructor(server: any) {
        this.io = new Server(server);
        this.io.on("connection", (socket: Socket) => {
            console.log("A user connected");

            socket.on("disconnect", () => {
                console.log("User disconnected");
            });
        });
    }

    public joinRoom(socketId: string, roomName: string): void {
        this.io.sockets.sockets.get(socketId)?.join(roomName);
    }

    public leaveRoom(socketId: string, roomName: string): void {
        this.io.sockets.sockets.get(socketId)?.leave(roomName);
    }

    public sendMessageToRoom(roomName: string, eventName: string, data: any): void {
        this.io.to(roomName).emit(eventName, data);
    }

    public sendMessageToSocket(socketId: string, eventName: string, data: any): void {
        this.io.to(socketId).emit(eventName, data);
    }

    public onEvent(eventName: string, callback: Function): void {
        this.io.on(eventName, (socket: Socket, data: any) => {
            callback(socket, data);
        });
    }

    public disconnectSocket(socketId: string): void {
        this.io.sockets.sockets.get(socketId)?.disconnect();
    }
}