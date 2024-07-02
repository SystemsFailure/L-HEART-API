import { Server, Socket } from "socket.io";

interface ChatMessage {
    sender: string;
    type: "text" | "audio" | "video" | "image";
    content: any;
    timestamp: number;
}

interface Chat {
    id: string;
    members: Set<string>;
    messages: ChatMessage[];
}

interface Notification {
    type: string;
    content: any;
    priority?: number;
    tags?: string[];
}

export default class ChatService {
    private io: Server;
    private chats: Map<string, Chat>;

    constructor(server: any) {
        this.io = new Server(server);
        this.chats = new Map();

        this.setupSocketListeners();
    }

    private setupSocketListeners(): void {
        this.io.on("connection", (socket: Socket) => {
            console.log("A user connected");

            socket.on("disconnect", () => {
                console.log("User disconnected");
                // Clean up user from any chats
                this.removeUserFromChats(socket.id);
            });

            socket.on("joinChat", (chatId: string) => {
                socket.join(chatId);
                console.log(`User ${socket.id} joined chat ${chatId}`);
            });

            socket.on("leaveChat", (chatId: string) => {
                socket.leave(chatId);
                console.log(`User ${socket.id} left chat ${chatId}`);
            });

            socket.on("chatMessage", (chatId: string, message: ChatMessage) => {
                this.handleChatMessage(socket, chatId, message);
            });
        });
    }

    private handleChatMessage(socket: Socket, chatId: string, message: ChatMessage): void {
        const chat = this.chats.get(chatId);
        if (chat) {
            message.sender = socket.id;
            message.timestamp = Date.now();
            chat.messages.push(message);
            this.chats.set(chatId, chat);
            this.io.to(chatId).emit("chatMessage", message);
            console.log(`Message (${message.type}) sent to chat ${chatId} by ${socket.id}`);
        }
    }

    public sendNotification(target: string | string[], notification: Notification): void {
        const targets = Array.isArray(target) ? target : [target];
        targets.forEach((socketId) => {
            this.sendMessageToSocket(socketId, "notification", notification);
        });
    }

    public createChat(chatId: string, members: string[]): void {
        this.chats.set(chatId, { id: chatId, members: new Set(members), messages: [] });
    }

    public addChatMember(chatId: string, member: string): void {
        const chat = this.chats.get(chatId);
        if (chat) {
            chat.members.add(member);
            this.chats.set(chatId, chat);
        }
    }

    public getChatHistory(chatId: string): ChatMessage[] | undefined {
        const chat = this.chats.get(chatId);
        return chat ? chat.messages : undefined;
    }

    private sendMessageToSocket(socketId: string, eventName: string, data: any): void {
        this.io.to(socketId).emit(eventName, data);
    }

    private removeUserFromChats(socketId: string): void {
        this.chats.forEach((chat, chatId) => {
            if (chat.members.has(socketId)) {
                chat.members.delete(socketId);
                this.chats.set(chatId, chat);
            }
        });
    }
}
