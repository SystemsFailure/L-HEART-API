import { Server, Socket } from "socket.io";
import RedisService from "./redis.service.js";

class SocketService {
    private static instance: SocketService;
    private io: Server;

    private constructor(server: any) {
        this.io = new Server(server);

        this.io.on("connection", (socket: Socket) => {
            console.log("A user connected");

            socket.on("disconnect", () => {
                console.log("User disconnected");
            });

            RedisService.subscribe("chat", (channel: any, message: any) => {
                console.log(`Received message on channel ${channel}: ${message}`);
                socket.emit("chatMessage", message);
            });
        });
    }

    public static getInstance(server: any): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService(server);
        }
        return SocketService.instance;
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

    public publishToRedis(channel: string, message: string): void {
        RedisService.publish(channel, message);
    }

    public subscribeToRedis(channel: string, callback: (channel: string, message: string) => void): void {
        RedisService.subscribe(channel, callback);
    }

    public unsubscribeFromRedis(channel: string): void {
        RedisService.unsubscribe(channel);
    }
}

export default SocketService.getInstance;
