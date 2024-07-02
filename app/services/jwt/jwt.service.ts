import env from "#start/env"
import jwt from 'jsonwebtoken';
import { JwtPayload, Algorithm } from "jsonwebtoken";

// Конфигурация для формирования нового jwt-токена
interface JwtCreationOptions {
    expiresIn: string | number,
    algorithm?: Algorithm | undefined,
    subject?: string | undefined,
    /** 
        @description опция subjectStrict - позволяет сделать режим подписи subject строгим. 
        Это значит, что если subjectStrict установить в значение true, то создать токен с subject, на основе которого уже был создан другой токен, не получится.
        По умолчанию эта опция отключена, а потому создать токен с уже использующимся subject можно
    */
    subjectStrict?: boolean | undefined,  
}

export class JwtService {
    private static instance: JwtService;    // Экземпляр сервиса
    private tokensStore: Set<string>;       // Хранилище состояния токенов
    private tokensSubjects: Set<string>;    // Хранилище субъектов токенов
    private secretKey: string;              // Секретный ключ 

    private constructor() {
        this.tokensStore = new Set();
        this.tokensSubjects = new Set();
        this.secretKey = env.get('APP_KEY'); // Замените на ваш секретный ключ
    }

    // Выдать экземпляр сервиса JWT
    public static getInstance(): JwtService {
        if (!JwtService.instance) {
            JwtService.instance = new JwtService();
        }
        return JwtService.instance;
    }

    // Выдача нового jwt токена
    public createToken(payload: string | object | Buffer, options: JwtCreationOptions ): string {
        try {

            // Если subject был передан и если токен с таким subject уже существует, то возникает ошибка unique subject, т.к subject - уникальный ключ
            /* 
                ** subject необходим для подписания токена некоторым уникальным значением, которое будет сопоставлять токен с некоторой реальной сущностью в приложении 
                    например это может быть пользователь, в таком случае для subject можно указать (например) ID пользователя, и тогда выданный ему токен можно будет относить к нему по его ID 
            */
            if(options.subject && options?.subjectStrict && options?.subjectStrict === true) {
                if(this.tokensSubjects.has(options.subject)) {
                    throw '=> Error ubject must be a unique key';
                }
                this.tokensSubjects.add(options.subject);  // Если проверка на уникальность прошла, то subject записывается в журнал учета subjects
            }
            const token = jwt.sign(payload, this.secretKey, { 
                algorithm: options.algorithm, 
                expiresIn:  options.expiresIn,
                subject: String(options.subject),
            });
            this.tokensStore.add(token);
            return token; 
        } catch (err) {
            console.error("JwtService: error when generating jwt-token", err);
            throw err;
        }
    }

    // Верификация существующего токена
    public verifyToken(token: string): JwtPayload | string | null {
        try {
            const decoded = jwt.verify(token, this.secretKey);
            return decoded;
        } catch (err) {
            console.error("JwtService: error when verificate jwt-token", err);
            throw err;
        }
    }

    // Удаление токена их хранилища tokensStore
    public deleteToken(token: string): boolean {
        try {
            return this.tokensStore.delete(token);
        } catch (err) {
            console.error("JwtService: error when delete jwt-token", err);
            throw err;
        }
    }

    // Проверка существования токена в tokensStore
    public isTokenStored(token: string): boolean {
        try {
            return this.tokensStore.has(token);
        } catch (err) {
            console.error("JwtService: error when check exists jwt-token", err);
            throw err;
        }
    }

    // Извлечение всех токенов из tokensStore
    public displayTokens() {
        const displayData = {
            values: this.tokensStore.values(),
            size: this.tokensStore.size,
        }
        console.log(displayData);
        return displayData;
    }
}
