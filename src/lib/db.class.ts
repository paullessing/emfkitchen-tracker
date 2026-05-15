import type { EatLog } from '$lib/log.types';
import {
  addLogToDay,
  computeTotals,
  convertDaysToLogs,
  createNewDay,
  getDateString,
} from '$lib/dataStorage.util';
import type { EaterTotals } from '$lib/EaterTotals.type';

export interface DatabasePersistor {
  getData(): Promise<EaterDay[]>;
  save(data: EaterDay): Promise<void>;
}

type Timestamp = number;

export interface EaterDay {
  date: string;
  orga: DayMeals;
  volunteers: DayMeals;
}

export interface DayMeals {
  breakfast: Timestamp[];
  lunch: Timestamp[];
  dinner: Timestamp[];
  night: Timestamp[];
}

export class Database {
  constructor(private readonly persistor: DatabasePersistor) {}

  public async addEntry(time: Date, type: EatLog['type']): Promise<void> {
    const data: EaterDay[] = await this.persistor.getData();
    const dateString = getDateString(time);

    let day = data.find(({ date }) => date === dateString);
    if (!day) {
      day = createNewDay(dateString);
    }

    addLogToDay(day, time, type);

    await this.persistor.save(day);
  }

  public async getTotals(now: Date = new Date()): Promise<EaterTotals> {
    const data = await this.persistor.getData();

    return computeTotals(now, data);
  }

  public async getTotalsByDay(): Promise<Record<string, number>> {
    const data = await this.persistor.getData();

    return data.reduce<Record<string, number>>((totals, day) => {
      totals[day.date] = convertDaysToLogs([day]).length;
      return totals;
    }, {});
  }

  public async getAllLogsForDays(days: string[]): Promise<EatLog[]> {
    const data = await this.persistor.getData();

    return data.reduce<EatLog[]>(
      (logs, day) => (days.includes(day.date) ? logs.concat(convertDaysToLogs([day])) : logs),
      [],
    );
  }
}
