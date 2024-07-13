import { CronJob, CronJobParams } from 'cron';

export default class CronService {
    private jobs: { [id: string]: CronJob };

    constructor() {
        this.jobs = {};
    }

    /**
     * Добавляет новую cron задачу с указанным ID, расписанием cron и функцией задачи.
     * @param id Уникальный идентификатор для cron задачи.
     * @param cronTime Расписание cron или дата, когда задача должна запуститься.
     * @param task Функция, которая будет выполнена при запуске cron задачи.
     */
    public addTask(id: string, cronTime: CronJobParams<null, null>["cronTime"], task: () => void): void {
        const job = new CronJob(cronTime, task);
        this.jobs[id] = job;
    }

    /**
     * Запускает cron задачу по указанному ID.
     * @param id ID задачи, которую нужно запустить.
     */
    public startTask(id: string): void {
        const job = this.jobs[id];
        if (job) {
            job.start();
        }
    }

    /**
     * Останавливает cron задачу по указанному ID.
     * @param id ID задачи, которую нужно остановить.
     */
    public stopTask(id: string): void {
        const job = this.jobs[id];
        if (job) {
            job.stop();
        }
    }

    /**
     * Удаляет cron задачу по указанному ID.
     * @param id ID задачи, которую нужно удалить.
     */
    public removeTask(id: string): void {
        const job = this.jobs[id];
        if (job) {
            job.stop();
            delete this.jobs[id];
        }
    }

    /**
     * Проверяет, запущена ли cron задача по указанному ID.
     * @param id ID задачи, состояние которой нужно проверить.
     * @returns true, если задача запущена, в противном случае false.
     */
    public isTaskRunning(id: string): boolean {
        const job = this.jobs[id];
        return job ? job.running : false;
    }

    /**
     * Возвращает массив всех ID текущих активных cron задач.
     * @returns Массив строк, представляющих ID активных cron задач.
     */
    public getAllTasks(): string[] {
        return Object.keys(this.jobs);
    }
}
