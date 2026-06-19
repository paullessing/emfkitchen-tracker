import type { EatLog } from '$lib/log.types';
import {
  computeTotals,
  convertDaysToLogs,
  getDateString,
  getMealTime,
} from '$lib/dataStorage.util';
import type { EaterTotals } from '$lib/EaterTotals.type';
import type { EaterType } from '$lib/EaterType.type';

export interface DatabasePersistor {
  getData(): Promise<EaterDay[]>;
  addMealEntry(
    date: string,
    type: EaterType,
    meal: keyof DayMeals,
    timestamp: number,
  ): Promise<void>;
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

  public async addEntry(time: Date, type: EaterType): Promise<void> {
    await this.persistor.addMealEntry(getDateString(time), type, getMealTime(time), time.getTime());
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
