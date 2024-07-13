import dbConfig from "#config/database";
import { HealthCheckable, HealthCheckObserver, HealthCheckResult, HealthCheckSubject } from "./types.js";
import db from '@adonisjs/lucid/services/db'

// Реализация health-check сервиса
export class HealthCheckService implements HealthCheckSubject {
    private observers: HealthCheckObserver[] = [];

    addObserver(observer: HealthCheckObserver) {
        this.observers.push(observer);
    }

    removeObserver(observer: HealthCheckObserver) {
        const index = this.observers.indexOf(observer);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyObservers(serviceName: string, status: boolean) {
        this.observers.forEach(observer => {
            observer.update(serviceName, status);
        });
    }

    // Метод для проверки состояния сервиса
    async checkService(serviceName: string, database: boolean = false): Promise<boolean> {
        if (database) {
            // Проверка для баз данных, работают ли они сейчас и др. инфа
            const dbType = dbConfig.connection;
            if (
                dbType === 'postgres'
            ) {
                // Проверка базы данных postgres
                try {
                    await db.rawQuery('SELECT 1+1 as result');
                    return true;
                } catch (error) {
                    console.error('Error while checking database:', error);
                    return false;                    
                }
            }
        }
        // Логика проверки состояния сервиса serviceName
        // Возвращаем true если сервис доступен, false если нет
        return true;
    }

    // Отдельный метод для проверки статуса базы данных
    async checkDatabase() {
        const isDatabaseHealthy: boolean = await this.checkService('Database', true); // Получаем статус базы данных
        this.notifyObservers('Database', isDatabaseHealthy); // Отправляем наблюдателям статус базы данных
    }

    // Метод для запуска health-check для конкретного сервиса
    async performHealthCheck(serviceName: string) {
        const status = await this.checkService(serviceName);
        this.notifyObservers(serviceName, status);
    }
}

// Реализация наблюдателя (логгер для health-check)
class HealthCheckLogger implements HealthCheckObserver {
    update(serviceName: string, status: boolean) {
        console.log(`Service ${serviceName} is ${status ? 'up' : 'down'}`);
    }
}

// // Пример использования
// const healthCheckService = new HealthCheckService();
// const logger = new HealthCheckLogger();

// healthCheckService.addObserver(logger);

// // Запуск health-check для сервиса
// const serviceName = 'MyService';
// healthCheckService.performHealthCheck(serviceName);


/** 
 * Health-check v2
*/



// Данный отдельный класс нужен для проверки компонентов программы
export class HealthCheckServiceV2 {
    private components: HealthCheckable[];

    constructor(components: HealthCheckable[]) {
        this.components = components;
    }

    // Метод для запуска health-check для всех компонентов
    async checkAll(): Promise<HealthCheckResult[]> {
        const results: HealthCheckResult[] = [];

        for (const component of this.components) {
            try {
                const result = await component.checkHealth();
                results.push(result);
            } catch (error) {
                results.push({
                    component: 'Unknown',
                    healthy: false,
                    message: `Health-check failed for component. Error: ${error.message}`,
                });
            }
        }

        return results;
    }
}

/**
 * Пример использования
 */

// Для наследования нескольких классов можно использовать паттерн mixin

// // Пример конкретного компонента, поддерживающего health-check
// class DatabaseComponent implements HealthCheckable {
//     async checkHealth(): Promise<HealthCheckResult> {
//         // Логика проверки доступности базы данных
//         const isDatabaseHealthy = true; // Предположим, что база данных доступна

//         if (isDatabaseHealthy) {
//             return {
//                 component: 'Database',
//                 healthy: true,
//             };
//         } else {
//             return {
//                 component: 'Database',
//                 healthy: false,
//                 message: 'Database connection failed',
//             };
//         }
//     }
// }

// // Использование HealthCheckService для проверки всех компонентов
// async function main() {
//     const databaseComponent = new DatabaseComponent();
//     const healthCheckService = new HealthCheckServiceV2([databaseComponent]);

//     const results = await healthCheckService.checkAll();

//     results.forEach(result => {
//         console.log(`${result.component} is ${result.healthy ? 'healthy' : 'unhealthy'}`);
//         if (!result.healthy && result.message) {
//             console.log(`Error message: ${result.message}`);
//         }
//     });
// }
