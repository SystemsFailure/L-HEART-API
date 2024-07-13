// Интерфейс для базового health-check сервиса
interface HealthCheck {
    performHealthCheck(serviceName: string): boolean;
}

// Реализация базового health-check сервиса
export class BaseHealthCheck implements HealthCheck {
    performHealthCheck(serviceName: string): boolean {
        // Логика базовой проверки состояния сервиса serviceName
        // Возвращаем true если сервис доступен, false если нет
        return true;
    }
}

// Декоратор для health-check сервиса с логированием времени выполнения
export class HealthCheckTimeLoggerDecorator implements HealthCheck {
    private baseHealthCheck: HealthCheck;

    constructor(baseHealthCheck: HealthCheck) {
        this.baseHealthCheck = baseHealthCheck;
    }

    performHealthCheck(serviceName: string): boolean {
        const startTime = Date.now();
        const result = this.baseHealthCheck.performHealthCheck(serviceName);
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`Health check for ${serviceName} took ${duration} ms`);

        return result;
    }
}

// // Пример использования декоратора
// const baseHealthCheck = new BaseHealthCheck();
// const timeLoggedHealthCheck = new HealthCheckTimeLoggerDecorator(baseHealthCheck);

// // Запуск health-check с использованием декорированного сервиса
// const serviceNameToCheck = 'MyService';
// const isServiceUp = timeLoggedHealthCheck.performHealthCheck(serviceNameToCheck);
// console.log(`Service ${serviceNameToCheck} is ${isServiceUp ? 'up' : 'down'}`);
