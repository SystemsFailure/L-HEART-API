import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import RestError from './axios.error.js';
import { DEFAULT_TIMEOUT, MAX_REDIRECTS, VALID_STATUS_MAX, VALID_STATUS_MIN } from './constants.js';
import { RequestOptions } from './types.js';

class RestClient {
    private http: AxiosInstance;
    private useTokenForRequests?: boolean;
    private token?: string;
    private defaultParams?: Record<string, any>;

    constructor({ useToken = false, token }: { useToken?: boolean; token?: string } = {}) {
        // Создание экземпляра Axios с предустановленными заголовками
        this.http = axios.create({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        // Установка флага использования токена для запросов и самого токена, если предоставлены
        this.useTokenForRequests = useToken || false;
        this.token = token || undefined;
        // Настройка перехватчиков (интерсепторов) запросов и ответов Axios
        this.setupInterceptors();
    }

    /**
     * Выполняет HTTP-запрос с заданными параметрами.
     * @param reqParams Параметры запроса
     * @returns Данные ответа
     */
    public async request(reqParams: RequestOptions): Promise<any> {
        const options: AxiosRequestConfig = {
            method: reqParams.method,
            url: reqParams.url,
            params: reqParams.params,
            headers: reqParams.headers || {},
            timeout: reqParams.timeout || DEFAULT_TIMEOUT,
            maxRedirects: reqParams.maxRedirects || MAX_REDIRECTS,
            validateStatus: (status) => status >= VALID_STATUS_MIN && status < VALID_STATUS_MAX,
        };

        try {
            const response: AxiosResponse = await this.http.request(options);
            return response.data;
        } catch (error) {
            // Обработка ошибок запроса, создание кастомного объекта ошибки RestError
            return new RestError(error);
        }
    }

    /**
     * Настройка перехватчиков запросов и ответов Axios.
     * Устанавливает авторизационный заголовок и параметры по умолчанию.
     */
    private setupInterceptors(): void {
        // Перехват запросов перед отправкой
        this.http.interceptors.request.use(this.handleRequestInterceptors.bind(this));
        // Перехват успешных ответов
        this.http.interceptors.response.use(
            this.handleResponseSuccessInterceptors.bind(this),
            this.handleResponseErrorInterceptors
        );
    }

    /**
     * Обработка перехватчика запросов перед отправкой.
     * @param config Конфигурация запроса Axios
     * @returns Конфигурация запроса с добавленными заголовками или параметрами
     */
    private handleRequestInterceptors(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
        // Добавление авторизационного заголовка, если необходимо
        if (this.useTokenForRequests && this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }
        // Добавление параметров по умолчанию к запросу, если они заданы
        if (this.defaultParams) {
            config.params = { ...config.params, ...this.defaultParams };
        }
        return config;
    }

    /**
     * Обработка перехватчика успешного ответа.
     * Добавляет информацию о статусе запроса к данным ответа.
     * @param response Ответ от Axios
     * @returns Тот же ответ с добавленным свойством `request_status`
     */
    private handleResponseSuccessInterceptors(response: AxiosResponse): AxiosResponse {
        // Добавление статуса запроса к данным ответа для POST-запросов
        if (response.request?.method === 'POST') {
            response.data['request_status'] = response.status === 200 ? 'success' : 'failure';
        }
        return response;
    }

    /**
     * Обработка перехватчика ошибок ответа.
     * Просто передает ошибку дальше для обработки в вызывающем коде.
     * @param error Ошибка ответа от Axios
     * @returns Промис, отклоненный с переданной ошибкой
     */
    private handleResponseErrorInterceptors(error: any): Promise<any> {
        return Promise.reject(error);
    }
}

export default RestClient;
