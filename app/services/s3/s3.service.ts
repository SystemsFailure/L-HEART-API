import AWS from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request.js';
import fs from 'fs';

export interface S3ServiceConfig {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
}

class S3Service {
    private s3: AWS.S3;
    private bucketName: string;

    constructor(config: S3ServiceConfig) {
        this.s3 = new AWS.S3({
            endpoint: config.endpoint,
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
            s3ForcePathStyle: true,
            httpOptions: {
                timeout: 30_000, // 30 seconds timeout
            },
        });
        this.bucketName = config.bucketName;
    }


    /**
     * Получение всех файлов из хранилища в бакете через пагинацию
     */
    public listAllObjects = async (bucketName: string, prefix: string): Promise<AWS.S3.ObjectList> => {
        let continuationToken = null;       // Элемент пагинайции, для получения файлов из бакета есть ограничение 1000 файлов, поэтому если count(files) > 1000 - используем это
        let allFiles: AWS.S3.ObjectList = [];

        const params: AWS.S3.ListObjectsV2Request = {
            Bucket: bucketName,
            Prefix: prefix // Задаем префикс для поиска файлов в конкретной папке
        };

        do {
            if (continuationToken) {
                params.ContinuationToken = continuationToken;
            }

            try {
                const data: PromiseResult<AWS.S3.ListObjectsV2Output, AWS.AWSError> = await this.s3.listObjectsV2(params).promise();
                allFiles = allFiles.concat(data.Contents!);             // Здесь мы объединяем массивы с файлами
                continuationToken = data.NextContinuationToken;       // Если есть еще не выбранные файлы, то мы их получаем из свойства NextContinuationToken;
            } catch (error) {
                console.error("Ошибка при получении списка файлов:", error);
                throw error;
            }
        } while (continuationToken);        // Выполняем до тех пор пока data.NextContinuationToken не будет = falsy значению

        return allFiles;
    };

    public async uploadFile(filePath: string, key: string, contentType: string = ''): Promise<void> {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Файл не найден: ${filePath}`);
        }

        const fileContent = fs.readFileSync(filePath);
        const params: AWS.S3.PutObjectRequest = {
            Bucket: this.bucketName,
            Key: key,
            Body: fileContent,
            ContentType: contentType || undefined,
        };

        try {
            const data = await this.s3.upload(params).promise();
            console.log(`File uploaded successfully at ${data.Location}`);
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    public async downloadFile(key: string, downloadPath: string): Promise<void> {
        const params = {
            Bucket: this.bucketName,
            Key: key,
        };

        try {
            const data = await this.s3.getObject(params).promise();
            fs.writeFileSync(downloadPath, data.Body as Buffer);
            console.log(`File downloaded successfully to ${downloadPath}`);
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    public async deleteFile(key: string): Promise<void> {
        const params = {
            Bucket: this.bucketName,
            Key: key,
        };

        try {
            await this.s3.deleteObject(params).promise();
            console.log(`File deleted successfully from ${this.bucketName}/${key}`);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    public getFileURL(key: string): string {
        return `${'https://cf5d9d8b-f013-4092-8bb5-7aa3e72dab14.selstorage.ru'}/${key}`;
    }
}

export default S3Service;