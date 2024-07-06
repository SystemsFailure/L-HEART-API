import crypto from 'crypto';
import NodeCache from 'node-cache';

// Класс сервиса для работы с шифрованием, кэшированием, дешифровкой и верификацией
export default class CryptoService {
    private encryptionAlgorithm: string;
    private key: string;
    private cache: NodeCache;

    constructor(encryptionAlgorithm: string, key: string) {
        this.encryptionAlgorithm = encryptionAlgorithm;
        this.key = key;
        this.cache = new NodeCache();
    }

    // Метод для шифрования данных
    encryptData(data: string): string {
        const cipher = crypto.createCipher(this.encryptionAlgorithm, this.key);
        let encryptedData = cipher.update(data, 'utf8', 'hex');
        encryptedData += cipher.final('hex');
        return encryptedData;
    }

    // Метод для дешифровки данных
    decryptData(encryptedData: string): string {
        const decipher = crypto.createDecipher(this.encryptionAlgorithm, this.key);
        let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
        decryptedData += decipher.final('utf8');
        return decryptedData;
    }

    // Метод для хэширования данных
    hashData(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    // Метод для верификации данных
    verifyData(data: string, hash: string): boolean {
        const hashedData = this.hashData(data);
        return hashedData === hash;
    }

    // Метод для кэширования данных
    cacheData(key: string, value: any, ttl: number): void {
        this.cache.set(key, value, ttl);
    }

    // Метод для получения кэшированных данных
    getCachedData(key: string): any {
        return this.cache.get(key);
    }

    // Асинхронный метод для шифрования данных
    async encryptDataAsync(data: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.encryptData(data));
            } catch (error) {
                reject(error);
            }
        });
    }

    // Асинхронный метод для дешифровки данных
    async decryptDataAsync(encryptedData: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.decryptData(encryptedData));
            } catch (error) {
                reject(error);
            }
        });
    }

    // Асинхронный метод для хэширования данных
    async hashDataAsync(data: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.hashData(data));
            } catch (error) {
                reject(error);
            }
        });
    }

    // Асинхронный метод для верификации данных
    async verifyDataAsync(data: string, hash: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.verifyData(data, hash));
            } catch (error) {
                reject(error);
            }
        });
    }
}

// Базовый класс для работы с шифрованием и дешифрованием
export abstract class CryptoServiceAbstract {
    protected algorithm: string;

    constructor(algorithm: string) {
        this.algorithm = algorithm;
    }

    // Абстрактные методы, которые будут реализованы в дочерних классах
    abstract encrypt(data: string, key: string): Promise<string>;
    abstract decrypt(data: string, key: string): Promise<string>;

    // Синхронный метод для верификации данных
    verify(data: string, signature: string, publicKey: string): boolean {
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(data);
        return verifier.verify(publicKey, signature, 'base64');
    }
}

// Класс для работы с симметричным шифрованием
export class SymmetricCryptoService extends CryptoServiceAbstract {
    constructor() {
        super('aes-256-cbc');
    }

    async encrypt(data: string, key: string): Promise<string> {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(key), iv);
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return iv.toString('base64') + ':' + encrypted;
    }

    async decrypt(data: string, key: string): Promise<string> {
        const parts = data.split(':');
        const iv = Buffer.from(parts.shift()!, 'base64');
        const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(key), iv);
        let decrypted = decipher.update(parts.join(':'), 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

// Класс для работы с асимметричным шифрованием
export class AsymmetricCryptoService extends CryptoServiceAbstract {
    constructor() {
      super('rsa');
    }
  
    async encrypt(data: string, publicKey: string): Promise<string> {
      const buffer = Buffer.from(data, 'utf8');
      const encrypted = crypto.publicEncrypt(publicKey, buffer);
      return encrypted.toString('base64');
    }
  
    async decrypt(data: string, privateKey: string): Promise<string> {
      const buffer = Buffer.from(data, 'base64');
      const decrypted = crypto.privateDecrypt({
        key: privateKey,
        passphrase: '',
      }, buffer);
      return decrypted.toString('utf8');
    }
  }