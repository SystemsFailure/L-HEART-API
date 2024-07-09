import { ErrorObject } from "./types.js";

class RestError extends Error {
    public errorType: string;
    public code?: number;
    public params?: any;

    /**
     * Конструктор класса RestError.
     * @param error Объект ошибки типа ErrorObject или Error
     */
    constructor(error: ErrorObject) {
        let errorMessage = '';

        // Определение сообщения ошибки
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = error.error;
        }

        // Вызов конструктора Error для инициализации сообщения
        super(errorMessage);

        // Инициализация дополнительных свойств ошибки
        if (!(error instanceof Error)) {
            this.name = error.name || 'RestError';  // Устанавливаем имя ошибки
            this.code = error.code;  // Устанавливаем код ошибки, если указан
        }

        // Определение типа ошибки на основе кода
        this.errorType = this.getErrorType(this.code || 500);

        // Установка дополнительных параметров ошибки, если они переданы
        if (error.params) {
            this.params = error.params;
        }

        // Установка корректной прототипной цепочки для экземпляра RestError
        Object.setPrototypeOf(this, RestError.prototype);
    }

    /**
     * Возвращает строковое представление типа ошибки на основе кода.
     * @param code Код ошибки
     * @returns Тип ошибки в виде строки
     */
    private getErrorType(code: number): string {
        switch (code) {
            case 0:
                return 'AUTH_DECLINED';  // Отказ в авторизации
            case 1:
                return 'MISSING_INPUT_PARAM';  // Отсутствует обязательный входной параметр
            case 2:
                return 'INVALID_INPUT_PARAM';  // Некорректный входной параметр
            case 404:
                return 'NOT_FOUND';  // Ресурс не найден
            default:
                return 'INTERNAL_SERVER_ERROR';  // Внутренняя ошибка сервера по умолчанию
        }
    }
}

export default RestError;
