// Параметры, которые принимает функция для создания базового адреса
export type BuildURLParams = {
    protocol?: string,
    url?: string,
    port?: string,
}
// Опции для метода запроса request
export interface RequestOptions {
    method: string;
    url: string;
    params?: Record<string, any>;
    headers?: Record<string, any>;
    timeout?: number;
    maxRedirects?: number;
}
// Тип кастомного объекта ошибки
export interface ErrorObject {
    error: string;
    name?: string;
    code?: number;
    params?: any;
}