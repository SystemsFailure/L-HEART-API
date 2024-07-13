// Интерфейс для наблюдателя health-check
export interface HealthCheckObserver {
    update(serviceName: string, status: boolean): void;
}

// Интерфейс для наблюдаемого объекта health-check
export interface HealthCheckSubject {
    addObserver(observer: HealthCheckObserver): void;
    removeObserver(observer: HealthCheckObserver): void;
    notifyObservers(serviceName: string, status: boolean): void;
}

// Интерфейс для компонентов, которые поддерживают health-check
export interface HealthCheckable {
    checkHealth(): Promise<HealthCheckResult>;
}

// Результат health-check
export interface HealthCheckResult {
    component: string; // Название компонента
    healthy: boolean;  // Здоров ли компонент
    message?: string;  // Дополнительное сообщение (опционально)
}