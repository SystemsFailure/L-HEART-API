import { CronTime } from "cron";

export interface CronTask {
    id: string;
    cronTime: string | Date | CronTime;
    task: () => void;
}