import * as workerpool from 'workerpool';
import { Task } from './types.js';

export default class ThreadPoolService {
    private pool: workerpool.Pool;

    constructor(poolSize: number = 4) {
        this.pool = workerpool.pool({ maxWorkers: poolSize });
    }

    // Метод для добавления задачи в пул потоков
    public async addTask(taskData: any, taskCallback: () => void): Promise<void> {
        const task: Task = {
            id: Math.random(),
            data: taskData,
        };

        await this.pool.exec(this.workerTask, [task, taskCallback]);
    }

    // Задача, которую выполняют рабочие потоки
    private async workerTask(task: Task, collback: () => void): Promise<void> {
        console.log(`Task ${task.id} started with data: ${task.data}`);
        await new Promise(collback);
        console.log(`Task ${task.id} completed`);
    }

    // Метод для закрытия пула потоков
    public async shutdown(): Promise<void> {
        await this.pool.terminate();
    }
}

// // Пример использования
// async function exampleUsage() {
//     const threadPool = new ThreadPoolService(4); // Создаем пул из 4 потоков

//     // Добавляем несколько задач
//     await threadPool.addTask('Task 1 data', () => {});
//     await threadPool.addTask('Task 2 data', () => {});
//     await threadPool.addTask('Task 3 data', () => {});

//     // Дожидаемся выполнения задач
//     await threadPool.shutdown(); // Закрываем пул потоков
// }