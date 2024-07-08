// Рабочий процесс логгера pino
import { pino } from "pino";
import fs from 'fs';


export type logLevels = 'info' | 'debug' | 'error' | 'fatal' | 'silent' | 'trace' | 'warn';
export type LogScope = 'services' | 'controllers' | 'database';
export type TypeLog = "INFO" | "ERROR";
export interface LogFilterOptions {
    typeLog?: TypeLog;
    fromDT?: number; 
    toDT?: number;
    fnName?: string;
    excludeFnName?: string;
}
export interface StdOut extends LogFilterOptions { enable: boolean };
export type StdIn = { 
    scope: LogScope, 
    level: logLevels, 
    message: string,
    output?: StdOut
};
const logsPathes = {
    controllers: './logs/controllers.log',
    database: './logs/database.log',
    services: './logs/services.log',
}


// ./ - корень приложения ( L-HEART-API/logs/... )
const databaseLogStream = pino.destination(logsPathes.database);
const databaseLogger = pino(databaseLogStream);
const controllerLogStream = pino.destination(logsPathes.controllers);
const controllerLogger = pino(controllerLogStream);
const serviceLogStream = pino.destination(logsPathes.services);
const serviceLogger = pino(serviceLogStream);

const logger = pino({
    transport: {
        target: 'pino-pretty'
    }
});



process.on('message', (data: StdIn) => {
    // Если запрос приходит от декоратора c областью "service"
    if(!data.output || data.output?.enable !== true) {
        if(data.scope === 'services') {
            logger[data.level](data.message);
            serviceLogger[data.level](data.message);
        }
        // Если запрос приходит от декоратора c областью "controller"
        if(data.scope === 'controllers') {
            logger[data.level](data.message);
            controllerLogger[data.level](data.message);
        }
        // Если запрос приходит от декоратора c областью "database"
        if(data.scope === 'database') {
            logger[data.level](data.message);
            databaseLogger[data.level](data.message);
        }
    }
    // Если при запросе логирования был передан объект параметров output, для извлечения логов из файлов
    else if(data.output && data.output.enable === true) {

        // Извлечение 
        const result = fs.readFileSync(`./logs/${data.scope}.log`, 'utf-8');
        if(typeof result === 'string') {
            const arrayObjectsLogs = result.split('\n').map((log) => {
                if(!!log) return JSON.parse(log);
            });
            let filteredByTypeLog = filterLogsByTypeLog(arrayObjectsLogs, data.output.typeLog);
            let filteredByFnName = filterLogsByFnName(filteredByTypeLog, data.output.fnName);
            let filteredExcludeFnName = filterLogsExcludeFnName(filteredByFnName, data.output.excludeFnName);
            let filteredByFromDT = filterLogsByFromDT(filteredExcludeFnName, data.output.fromDT);
            let filteredByToDT = filterLogsByToDT(filteredByFromDT, data.output.toDT);
            process.send!({logs: filteredByToDT});
        }
    }
});


// Фильтрация массива полученных логгов по их типу например INFO или ERROR
function filterLogsByTypeLog(array: Array<any>, typeLog?: TypeLog) {
    if(typeLog) {
        return array.filter(entry => {
            if(!!entry?.msg && typeof entry.msg === 'string') {
                // Извлечение имени функции из ключа msg логга
                const computeTypeLog: string = entry.msg.split(' |')[0];
                if(computeTypeLog && computeTypeLog !== typeLog) return false;
                else return true;
            }
        });
    } 
    // Если фильтрация не была выполнена то возвращаем исходный массив
    else return array;
}

// Фильтрация массива полученных логгов по имени функции в опции excludeFnName
function filterLogsByFnName(array: Array<any>, fnName?: string) {
    if(fnName) {
        return array.filter(entry => {
            if(!!entry?.msg && typeof entry.msg === 'string') {
                // Извлечение имени функции из ключа msg логга
                const computeFnName: string = entry.msg.replace(/.*<|>.*/g, "");
                if(computeFnName !== fnName) return false;
                else return true;
            }
        });
    } 
    // Если фильтрация не была выполнена то возвращаем исходный массив
    else return array;
}

// Фильтрация массива полученных логгов исключая логи с имени функции 
function filterLogsExcludeFnName(array: Array<any>, excludeFnName?: string) {
    if(excludeFnName) {
        return array.filter(entry => {
            if(!!entry?.msg && typeof entry.msg === 'string') {
                // Извлечение имени функции из ключа msg логга
                const computeFnName: string = entry.msg.replace(/.*<|>.*/g, "");
                if(computeFnName === excludeFnName) return false;
                else return true;
            }
        });
    } 
    // Если фильтрация не была выполнена то возвращаем исходный массив
    else return array;
}

// Фильтрация массива полученных логгов по From Date Time (В результат ВКЛЮЧИТЕЛЬНО попадают логи с временем создания не ранее указанного в фильтрации времени)
function filterLogsByFromDT(array: Array<any>, fromDT?: number) {
    if(fromDT) {
        return array.filter(entry => {
            if(!!entry?.time && typeof entry.time === 'number') {
                if(entry.time < fromDT) return false;
                else return true;
            }
        });
    } 
    // Если фильтрация не была выполнена то возвращаем исходный массив
    else return array;
}

// Фильтрация массива полученных логгов по To Date Time (В результат ВКЛЮЧИТЕЛЬНО попадают логи с временем создания не больше указанного в фильтрации времени)
function filterLogsByToDT(array: Array<any>, toDT?: number) {
    if(toDT) {
        return array.filter(entry => {
            if(!!entry?.time && typeof entry.time === 'number') {
                if(entry.time > toDT) return false;
                else return true;
            }
        });
    } 
    // Если фильтрация не была выполнена то возвращаем исходный массив
    else return array;
}


