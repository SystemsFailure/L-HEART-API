/* 
     ░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓███████▓▒░░▒▓████████▓▒░ 
    ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        
    ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        
    ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓██████▓▒░   
    ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        
    ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        
     ░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░ 
*/

// Рабочий процесс логгера pino
import { pino } from "pino";
import fs from 'fs';
import * as fsPromise from 'fs/promises';
import { Logger } from 'pino';


// области логгирования по которым будет выбираться поток логгирования в определеный файл.
//  Каждый scope должен одноименно совпадать с одним из ключей объекта logsPathes, потому что на основе путей из этого объекта 
//  формируются потоки логгирования и создаются logs-файлы и logs-директории
export type LogScope = 'services' | 'controllers' | 'database';
// ./ - корень приложения ( L-HEART-API/logs/... )
const logsPathes = {
    controllers: './logs/controllers.log',
    database: './logs/database.log',
    services: './logs/services.log',
}

export type logLevels = 'info' | 'debug' | 'error' | 'fatal' | 'silent' | 'trace' | 'warn';
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

interface ResultSplitFullDirPath {
    dirs: string[];
    files: string[];
    dirPath: string;
    filePath: string;
}

// Функция для разбития полного пути директории включая имена файлов в этом пути на отдельные массивы директорий и файлов
function splitFullDirPath(fullPath: string): ResultSplitFullDirPath {
    try {
        let rootDir = './';                         // корень пути
        let resultDirPath: string | './' = '';      // итоговый путь директорий. Пример: "./src/app/models"
        let resultFilesPath: string | '' = '';      // итоговый путь файлов (Обычно один файл выходит) Пример: "/service.log"
        const resultDirs: string[] = [];            // Результирующий массив названий директорий. Пример: ['src', 'app', 'models']
        const resultFiles: string[] = [];           // Результирующий массив названий файлов (Обычно один файл выходит). Пример: ['service.log']
        const pathSplit = fullPath.split('/');
        // Извлечение корня пути
        if (pathSplit[0] === '.') {
            if (pathSplit[1] === '') {
                rootDir = './'
            }
            rootDir = `./${pathSplit[1] ?? ''}`;
        }
        // Сперва в массив директорий записываем корень
        resultDirs.push('.');
        let computedRootForArray = rootDir.split('/')[1];
        if (computedRootForArray !== '' && computedRootForArray !== '.') resultDirs.push(computedRootForArray);

        // проходим по массиву строк пути исключая первые два элемента относящиеся к корню
        const lastPathes = pathSplit.slice(2);
        lastPathes.forEach((path: string) => {
            // если перебираемый элемент делится на строки по точке то элемент является файлом с каким-либо расширением
            if (path.split('.').length > 1) {
                resultFiles.push(path);
            }
            // Если элемент не проходит разделение на строки по точке то это директория
            else resultDirs.push(path);
        });

        resultDirPath = (resultDirs.length === 1 && resultDirs[0] === '.') ? './' : resultDirs.join('/');   // вычисление результрующего пути для директорий
        resultFilesPath = (resultFiles.length) ? ['', resultFiles].join('/') : '';                          // вычисление результрующего пути для файла(-ов)
        return {
            dirs: resultDirs,
            files: resultFiles,
            dirPath: resultDirPath,
            filePath:
                resultFilesPath
        } as ResultSplitFullDirPath;
    } catch (err) {
        console.error('Ошибка при разделении полного пути директории на имена директорий и файлов');
        throw 'Ошибка при разделении полного пути директории на имена директорий и файлов';
    }
}

// Проверка существования директории логгирования и сопутствующих в ней файлов логгирования
async function checkExistsLogsDirectory(dirname: string = './logs') {
    try {
        const promises: Promise<void>[] = [];
        const notExistsDirnames: string[] = [];
        [dirname, ...Object.values(logsPathes)].forEach((item: string) => {
            let promise = fsPromise.access(item, fsPromise.constants.F_OK).catch(() => {
                /* если fsPromise.access поднимает исключение, то файла или директории по текущему пути не существует.
                    В таком случае, перехватываем исключение помещяя текущий путь в итоговой массив для того чтобы в дальнейшем по этому массиву 
                    произошло создание log- директории и файлов
                */
                notExistsDirnames.push(item);
            });
            promises.push(promise); // помещаем промисы в массив чтобы после цикла последовательно выполнить их и получить массив путей либо пустой массив
        });
        await Promise.all(promises); // ожидается выполнение всех промисов проверки
        return notExistsDirnames;    // массив путей по которым нужно создать дериктории и файлы
    } catch (err) {
        console.error('Ошибка при проверке существования директории логгирования');
        throw 'Ошибка при проверке существования директории логгирования';
    }
}

// Инициализация директории логгирования по объекту logsPathes
async function initDirectoryLogs(pathes: string[] | []) {
    try {
        const promises: Promise<string | undefined | void>[] = [];

        pathes.forEach((path: string) => {
            const { dirPath, filePath } = splitFullDirPath(path);
            const promiseDir = fsPromise.mkdir(dirPath, { recursive: true }).catch((error) => {
                throw { msg: `Произошла ошибка при создании дериктории ${dirPath}`, error };
            })
            promises.push(promiseDir);

            if (!!filePath) {
                const promiseFile = fsPromise.writeFile(dirPath + filePath, '').catch((error) => {
                    throw { msg: `Произошла ошибка при создании файла ${filePath}`, error };
                })
                promises.push(promiseFile);
            }
        });

        await Promise.all(promises).catch(({ msg, error }) => {
            console.error(msg, error); // перехватываем внутренние ошибки при выполнении промисов
        });
        return true;
    } catch (err) {
        console.error('Ошибка при инициализации директории логгирования');
        throw 'Ошибка при инициализации директории логгирования';
    }
}

type LoggerObject = {
    [key: string]: Logger<never>;
};
// Инициализация потоков логирования в файлы
function initLogSteams(): LoggerObject {
    try {
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
        return { logger, databaseLogger, controllerLogger, serviceLogger }
    } catch (err) {
        console.error('Ошибка при инициализации потоков логгирования в log-файлы');
        throw 'Ошибка при инициализации потоков логгирования в log-файлы';
    }
}

// Запуск ядра логгирования
function ExecCore(streams: ReturnType<typeof initLogSteams>) {
    try {
        process.on('message', (data: StdIn) => {
            // Если запрос приходит от декоратора c областью "service"
            if (!data.output || data.output?.enable !== true) {
                if (data.scope === 'services') {
                    streams.logger[data.level](data.message);
                    streams.serviceLogger[data.level](data.message);
                }
                // Если запрос приходит от декоратора c областью "controller"
                if (data.scope === 'controllers') {
                    streams.logger[data.level](data.message);
                    streams.controllerLogger[data.level](data.message);
                }
                // Если запрос приходит от декоратора c областью "database"
                if (data.scope === 'database') {
                    streams.logger[data.level](data.message);
                    streams.databaseLogger[data.level](data.message);
                }
            }
            // Если при запросе логирования был передан объект параметров output, для извлечения логов из файлов
            else if (data.output && data.output.enable === true) {
                // Извлечение 
                const result = fs.readFileSync(`./logs/${data.scope}.log`, 'utf-8');
                if (typeof result === 'string') {
                    const arrayObjectsLogs = result.split('\n').map((log) => {
                        if (!!log) return JSON.parse(log);
                    });
                    let filteredByTypeLog = filterLogsByTypeLog(arrayObjectsLogs, data.output.typeLog);
                    let filteredByFnName = filterLogsByFnName(filteredByTypeLog, data.output.fnName);
                    let filteredExcludeFnName = filterLogsExcludeFnName(filteredByFnName, data.output.excludeFnName);
                    let filteredByFromDT = filterLogsByFromDT(filteredExcludeFnName, data.output.fromDT);
                    let filteredByToDT = filterLogsByToDT(filteredByFromDT, data.output.toDT);
                    process.send!({ logs: filteredByToDT });
                }
            }
        });
    } catch (error) {
        console.error('ExecCore: Ошибка при запуске ядра логгирования');
        throw 'ExecCore: Ошибка при запуске ядра логгирования';
    }
}
//==========================================================================================
/* 
    _____        _  _     * * * * * * * * * * * #############################    _____  
   |_   _|      (_)| |     * * * * * * * * * * *#############################   /  __ \    
     | |  _ __   _ | |_   * * * * * * * * * * * #############################   | /  \/  ___   _ __  ___ 
     | | | '_ \ | || __|  ###################################################   | |     / _ \ | '__|/ _ \
    _| |_| | | || || |_   ###################################################   | \__/\| (_) || |  |  __/
    \___/|_| |_||_| \__|  ###################################################    \____/ \___/ |_|   \___|
*/
// Для инциализации ядра логгирования, необходимо выполнить проверку на существования директории и файлов логгирования
checkExistsLogsDirectory()
    .then((res) => res)  // либо вернет пустой массив (значит директори и файлы существуют), либо вызовет исключение
    .catch((err) => {
        console.error('then > checkExistsLogsDirectory: => ', err);
    })  // перехватываем вероятные ошибки (которых по идее быть не должно)
    // если цепочка не потерпела участи одного известного корабля ⛵️, то выполняем создание дериктории логгирования (с log-файлами) 🙂
    .then(async (res) => {
        if (res) {
            if (res.length) {  // если массив путей дериктории не пуст, значит какой-либо директории не существует и её нужно создать
                return await initDirectoryLogs(res);
            } else {
                console.log('All directories already exists');
                return true;
            }
        } else {
            console.error('При проверке существования log-директории и log-файлов произошла ошибка');
            process.exit(1); // Если произошла ошибка не по сценарию вальса то прерываем процесс с кодом ошибки;
        }
    })
    .catch((err) => {
        console.error('then > initDirectoryLogs: => ', err);
    })
    // Запуск ядра логгирования
    .then((res) => {
        // Если все проверки/создания директории логгирования прошли успешно то запускаем ядро логгирования
        if (res === true) {
            const { logger, controllerLogger, databaseLogger, serviceLogger } = initLogSteams()
            ExecCore({ logger, controllerLogger, databaseLogger, serviceLogger });
            logger.info('Logger Core has been started');
        }
    })
/* 
             ____  ____  __   ____  ____  ____    SS
            ( ___)(_  _)(  ) (_  _)( ___)(  _ \ SS
             )__)  _)(_  )(__  )(   )__)  )   /  SSS
            (__)  (____)(____)(__) (____)(_)\_)    SSS
*/
// Фильтрация массива полученных логгов по их типу например INFO или ERROR
function filterLogsByTypeLog(array: Array<any>, typeLog?: TypeLog) {
    if (typeLog) {
        return array.filter(entry => {
            if (!!entry?.msg && typeof entry.msg === 'string') {
                // Извлечение имени функции из ключа msg логга
                const computeTypeLog: string = entry.msg.split(' |')[0];
                if (computeTypeLog && computeTypeLog !== typeLog) return false;
                else return true;
            }
        });
    }
    // Если фильтрация не была выполнена то возвращаем исходный массив
    else return array;
}

// Фильтрация массива полученных логгов по имени функции в опции excludeFnName
function filterLogsByFnName(array: Array<any>, fnName?: string) {
    if (fnName) {
        return array.filter(entry => {
            if (!!entry?.msg && typeof entry.msg === 'string') {
                // Извлечение имени функции из ключа msg логга
                const computeFnName: string = entry.msg.replace(/.*<|>.*/g, "");
                if (computeFnName !== fnName) return false;
                else return true;
            }
        });
    }
    // Если фильтрация не была выполнена то возвращаем исходный массив
    else return array;
}

// Фильтрация массива полученных логгов исключая логи с имени функции 
function filterLogsExcludeFnName(array: Array<any>, excludeFnName?: string) {
    if (excludeFnName) {
        return array.filter(entry => {
            if (!!entry?.msg && typeof entry.msg === 'string') {
                // Извлечение имени функции из ключа msg логга
                const computeFnName: string = entry.msg.replace(/.*<|>.*/g, "");
                if (computeFnName === excludeFnName) return false;
                else return true;
            }
        });
    }
    // Если фильтрация не была выполнена то возвращаем исходный массив
    else return array;
}

// Фильтрация массива полученных логгов по From Date Time (В результат ВКЛЮЧИТЕЛЬНО попадают логи с временем создания не ранее указанного в фильтрации времени)
function filterLogsByFromDT(array: Array<any>, fromDT?: number) {
    if (fromDT) {
        return array.filter(entry => {
            if (!!entry?.time && typeof entry.time === 'number') {
                if (entry.time < fromDT) return false;
                else return true;
            }
        });
    }
    // Если фильтрация не была выполнена то возвращаем исходный массив
    else return array;
}

// Фильтрация массива полученных логгов по To Date Time (В результат ВКЛЮЧИТЕЛЬНО попадают логи с временем создания не больше указанного в фильтрации времени)
function filterLogsByToDT(array: Array<any>, toDT?: number) {
    if (toDT) {
        return array.filter(entry => {
            if (!!entry?.time && typeof entry.time === 'number') {
                if (entry.time > toDT) return false;
                else return true;
            }
        });
    }
    // Если фильтрация не была выполнена то возвращаем исходный массив
    else return array;
}


