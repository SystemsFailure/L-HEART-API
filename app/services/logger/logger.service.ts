/* 
    ░▒▓█▓▒░      ░▒▓██████▓▒░ ░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓████████▓▒░▒▓███████▓▒░  
    ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ 
    ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ 
    ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒▒▓███▓▒░▒▓█▓▒▒▓███▓▒░▒▓██████▓▒░ ░▒▓███████▓▒░  
    ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ 
    ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ 
    ░▒▓████████▓▒░▒▓██████▓▒░ ░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░ 
*/

import loggingProcess from "#services/logger/logger_process_initialization";
import type { logLevels, LogScope } from '#services/logger/logger_pino_work_thread';
import { StdOut, LogFilterOptions } from '#services/logger/logger_pino_work_thread';

// Декоратор метода для логирования методов сервисов
export function serviceLogger(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originMethod: Function = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        try {
            await originMethod.apply(this, args);
            return loggingProcess.send({ scope: 'services' as LogScope, level: 'info' as logLevels, message: `INFO | [services]: <${key}> function called` });
        } catch (error) {
            loggingProcess.send({ scope: 'services' as LogScope, level: 'error' as logLevels, message: `ERROR | [services]: <${key}> function called: ${error}` });
        }
    };
    return descriptor;
}

// Декоратор метода для логирования методов контроллеров
export function controllerLogger(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originMethod: Function = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        try {
            await originMethod.apply(this, args);
            return loggingProcess.send({ scope: 'controllers' as LogScope, level: 'info' as logLevels, message: `INFO | [controllers]: <${key}> function called` });
        } catch (error) {
            loggingProcess.send({ scope: 'controllers' as LogScope, level: 'error' as logLevels, message: `ERROR | [controllers]: <${key}> function called: ${error}` });
        }
    };
    return descriptor;
}

// Декоратор метода для логирования методов базы данных
export function databaseLogger(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originMethod: Function = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        try {
            await originMethod.apply(this, args);
            return loggingProcess.send({ scope: 'database' as LogScope, level: 'info' as logLevels, message: `INFO | [database]: <${key}> function called` });
        } catch (error) {
            loggingProcess.send({ scope: 'database' as LogScope, level: 'error' as logLevels, message: `ERROR | [database]: <${key}> function called: ${error}` });
        }
    };
    return descriptor;
}

// Извлечение логов контроллеров из "root/logs/controllers.log"
export async function extractControllersLogs(searchParams?: LogFilterOptions) {
    return new Promise((resolve, reject) => {
        try {
            // Получение отфильтрованных логов из процесса-логгера 
            loggingProcess.once('message', ({ logs }: { logs: any }) => {
                resolve(logs);
            });
            // Отправка запроса к процессу-логгеру на извлечение логов по фильтрации
            loggingProcess.send({
                scope: 'controllers' as LogScope,
                level: 'info' as logLevels,
                message: `INFO | [logger]: <${extractControllersLogs.name}> function called`,
                output: {
                    enable: true,
                    typeLog: searchParams?.typeLog,
                    fromDT: searchParams?.fromDT,
                    toDT: searchParams?.toDT,
                    fnName: searchParams?.fnName,
                    excludeFnName: searchParams?.excludeFnName,
                } as StdOut,
            });
        } catch (error) {
            loggingProcess.send({ scope: 'controllers' as LogScope, level: 'error' as logLevels, message: `ERROR | [logger]: <${extractControllersLogs.name}> function called` });
        }
    })
}

// Извлечение логов сервисов из "root/logs/services.log"
export async function extractServicesLogs(searchParams?: LogFilterOptions) {
    return new Promise((resolve, reject) => {
        try {
            // Получение отфильтрованных логов из процесса-логгера 
            loggingProcess.once('message', ({ logs }: { logs: any }) => {
                resolve(logs);
            });
            // Отправка запроса к процессу-логгеру на извлечение логов по фильтрации
            loggingProcess.send({
                scope: 'services' as LogScope,
                level: 'info' as logLevels,
                message: `INFO | [logger]: <${extractServicesLogs.name}> function called`,
                output: {
                    enable: true,
                    typeLog: searchParams?.typeLog,
                    fromDT: searchParams?.fromDT,
                    toDT: searchParams?.toDT,
                    fnName: searchParams?.fnName,
                    excludeFnName: searchParams?.excludeFnName,
                } as StdOut,
            });
        } catch (error) {
            loggingProcess.send({ scope: 'services' as LogScope, level: 'error' as logLevels, message: `ERROR | [logger]: <${extractServicesLogs.name}> function called` });
        }
    })
}

// Извлечение логов сервисов из "root/logs/database.log"
export async function extractDatabaseLogs(searchParams?: LogFilterOptions) {
    return new Promise((resolve, reject) => {
        try {
            // Получение отфильтрованных логов из процесса-логгера 
            loggingProcess.once('message', ({ logs }: { logs: any }) => {
                resolve(logs);
            });
            // Отправка запроса к процессу-логгеру на извлечение логов по фильтрации
            loggingProcess.send({
                scope: 'database' as LogScope,
                level: 'info' as logLevels,
                message: `INFO | [logger]: <${extractDatabaseLogs.name}> function called`,
                output: {
                    enable: true,
                    typeLog: searchParams?.typeLog,
                    fromDT: searchParams?.fromDT,
                    toDT: searchParams?.toDT,
                    fnName: searchParams?.fnName,
                    excludeFnName: searchParams?.excludeFnName,
                } as StdOut,
            });
        } catch (error) {
            loggingProcess.send({ scope: 'database' as LogScope, level: 'error' as logLevels, message: `ERROR | [logger]: <${extractDatabaseLogs.name}> function called` });
        }
    })
}

