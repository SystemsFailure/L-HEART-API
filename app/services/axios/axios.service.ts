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
        this.http = axios.create({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        this.useTokenForRequests = useToken || false;
        this.token = token || undefined;
        this.setupInterceptors();
    }

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
            return new RestError(error);
        }
    }

    private setupInterceptors(): void {
        this.http.interceptors.request.use(this.handleRequestInterceptors.bind(this));
        this.http.interceptors.response.use(this.handleResponseSuccessInterceptors.bind(this), this.handleResponseErrorInterceptors);
    }

    private handleRequestInterceptors(config: InternalAxiosRequestConfig<any>): InternalAxiosRequestConfig<any> {
        if (this.useTokenForRequests && this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        if (this.defaultParams) {
            config.params = { ...config.params, ...this.defaultParams };
        }

        return config;
    }

    private handleResponseSuccessInterceptors(response: AxiosResponse): AxiosResponse {
        if (response.request?.method === 'POST') {
            response.data['request_status'] = response.status === 200 ? 'Accepted' : 'Delayed';
        }
        return response;
    }

    private handleResponseErrorInterceptors(error: any): Promise<any> {
        return Promise.reject(error);
    }
}

export default RestClient;