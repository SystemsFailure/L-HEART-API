import URI from 'urijs';
import { URL_PROTOCOL_HTTP, BASE_LOCAL_URL, BASE_LOCAL_PORT3000 } from '../constants.js';
import { BuildURLParams } from '../types.js';

/**
 * Возвращает полный путь до сервиса
 */
export const baseUrl = (useDefault: boolean, { url, protocol, port }: BuildURLParams): string | undefined => {
    if (useDefault) {
        return `${URL_PROTOCOL_HTTP}://${BASE_LOCAL_URL}:${BASE_LOCAL_PORT3000}`;
    } else if (url && protocol && port) {
        return `${protocol}://${url}:${port}`;
    }

    return undefined;
};

/**
 * Создает абсолютный url для axios-са из частей
 */
export const buildUrl = (baseUrl: string, ...args: string[]): string => {
    if (!baseUrl.trim()) {
        throw new Error('Base URL cannot be empty!');
    }

    const uri = URI.joinPaths(...args);
    const absoluteUri = uri.absoluteTo(baseUrl).preventInvalidHostname(true);

    if (!absoluteUri.hostname() || !absoluteUri.protocol()) {
        throw new Error('Invalid URL');
    }

    return absoluteUri.toString();
};
