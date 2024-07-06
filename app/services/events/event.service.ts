import EventEmitter from 'events';

class EventBus {
    private static instance: EventBus; // Статическое свойство для хранения единственного экземпляра EventBus
    private emitter: EventEmitter; // Экземпляр EventEmitter для работы с событиями

    private constructor() {
        this.emitter = new EventEmitter(); // Создание нового экземпляра EventEmitter при инициализации
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus(); // Создание нового экземпляра EventBus, если он еще не создан
        }
        return EventBus.instance; // Возвращение единственного экземпляра EventBus
    }

    public emit(event: string, data?: any): void {
        this.emitter.emit(event, data); // Генерация события с передачей данных
    }

    public on(event: string, listener: (...args: any[]) => void): void {
        this.emitter.on(event, listener); // Подписка на событие с указанием функции-обработчика
    }

    public off(event: string, listener: (...args: any[]) => void): void {
        this.emitter.off(event, listener); // Отписка от события
    }
}

export default EventBus;