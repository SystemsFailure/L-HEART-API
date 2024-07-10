/* 
    ░▒▓█▓▒░▒▓███████▓▒░░▒▓█▓▒░▒▓████████▓▒░ 
    ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░  ░▒▓█▓▒░     
    ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░  ░▒▓█▓▒░     
    ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░  ░▒▓█▓▒░     
    ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░  ░▒▓█▓▒░     
    ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░  ░▒▓█▓▒░     
    ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░  ░▒▓█▓▒░     
*/

// Инициализация отдельного PID процесса логгера в приложении
import { fork } from 'child_process';

// Запуск процесса для сервиса логгирования
const loggingProcess = fork(`${import.meta.dirname}/logger_pino_work_thread.ts`);

loggingProcess.on('error', (error) => {
    console.error(`Logger Worker error: ${error}`);
});

loggingProcess.on('exit', (code) => {
    console.log(`Logger Worker exit with code: ${code}`);
});

export default loggingProcess;