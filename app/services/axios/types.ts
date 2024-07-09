export type BuildURLParams = {
    protocol?: string,
    url?: string,
    port?: string,
}

export interface RequestOptions {
    method: string;
    url: string;
    params?: Record<string, any>;
    headers?: Record<string, any>;
    timeout?: number;
    maxRedirects?: number;
}

export interface ErrorObject {
    error: string;
    name?: string;
    code?: number;
    params?: any;
}