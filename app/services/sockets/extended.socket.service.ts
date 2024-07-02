import { Server, Socket } from "socket.io";

interface Notification {
    type: string;
    content: any;
    priority?: number;
    tags?: string[];
}

interface Chat {
    id: string;
    members: string[];
    messages: { sender: string; content: any; timestamp: number }[];
}

export default class NotificationService {
    private io: Server;
    private chats: Map<string, Chat>;

    constructor(server: any) {
        this.io = new Server(server);
        this.chats = new Map();

        this.io.on("connection", (socket: Socket) => {
            console.log("A user connected");

            socket.on("disconnect", () => {
                console.log("User disconnected");
            });

            socket.on("joinChat", (chatId: string) => {
                socket.join(chatId);
            });

            socket.on("leaveChat", (chatId: string) => {
                socket.leave(chatId);
            });

            socket.on("chatMessage", (chatId: string, message: any) => {
                const chat = this.chats.get(chatId);
                if (chat) {
                    chat.messages.push({ sender: socket.id, content: message, timestamp: Date.now() });
                    this.chats.set(chatId, chat);
                    this.io.to(chatId).emit("chatMessage", message);
                }
            });
        });
    }

    public sendNotification(target: string | string[], notification: Notification): void {
        if (Array.isArray(target)) {
            target.forEach((socketId) => {
                this.sendMessageToSocket(socketId, "notification", notification);
            });
        } else {
            this.sendMessageToSocket(target, "notification", notification);
        }
    }

    public createChat(chatId: string, members: string[]): void {
        this.chats.set(chatId, { id: chatId, members, messages: [] });
    }

    public addChatMember(chatId: string, member: string): void {
        const chat = this.chats.get(chatId);
        if (chat && !chat.members.includes(member)) {
            chat.members.push(member);
            this.chats.set(chatId, chat);
        }
    }

    public getChatHistory(chatId: string): { sender: string; content: any; timestamp: number }[] | undefined {
        const chat = this.chats.get(chatId);
        return chat ? chat.messages : undefined;
    }

    public sendPushNotification(deviceToken: string, notification: Notification): void {
        // Implement push notification logic here (for example, using Firebase Cloud Messaging or similar service).
        console.log(`Push notification sent to device ${deviceToken}:`, notification);
    }

    public tagMessages(tags: string[], target: string | string[]): void {
        // Logic to tag messages and send them to specified targets.
        // This can involve filtering messages based on tags and sending them accordingly.
        console.log(`Push notification sent to device ${tags}:`, target);

    }

    public manageNotification(notificationId: string, action: string): void {
        // Logic to manage notifications (e.g., hide, dismiss, repeat).
        console.log(`Push notification sent to device ${notificationId}:`, action);

    }

    private sendMessageToSocket(socketId: string, eventName: string, data: any): void {
        this.io.to(socketId).emit(eventName, data);
    }
}