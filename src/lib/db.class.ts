import type { EatLog } from '$lib/log.types';
import { computeTotals, getDateString, getMealTime } from '$lib/dataStorage.util';

export interface DatabasePersistor {
  getData(): Promise<EaterDay[]>;
  save(data: EaterDay[]): Promise<void>;
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

export interface EaterTotals {
  currentMeal: number;
  today: number;
  allTime: number;
  timestamp: number;
}

function createNewDay(date: string): EaterDay {
  return {
    date,
    orga: {
      breakfast: [],
      lunch: [],
      dinner: [],
      night: [],
    },
    volunteers: {
      breakfast: [],
      lunch: [],
      dinner: [],
      night: [],
    },
  };
}

function convertDayToList(day: EaterDay): EatLog[] {
  return (['volunteer', 'orga'] as const).flatMap((type) =>
    (['breakfast', 'lunch', 'dinner', 'night'] as (keyof DayMeals)[]).flatMap((meal) =>
      day[EaterTypeMap[type]][meal].map((timestamp: Timestamp) => ({
        type,
        timestamp,
      })),
    ),
  );
}

const EaterTypeMap = { volunteer: 'volunteers', orga: 'orga' } as const;

export class Database {
  constructor(private readonly persistor: DatabasePersistor) {}

  public async addEntry(timestamp: Date, type: 'volunteer' | 'orga'): Promise<void> {
    const data: EaterDay[] = await this.persistor.getData();

    const dateString = getDateString(timestamp);

    let day = data.find(({ date }) => date === dateString);
    if (!day) {
      day = createNewDay(dateString);
      data.push(day);
      data.sort((a, b) => (a.date < b.date ? -1 : 1));
    }

    const eatersInMeal = day[EaterTypeMap[type]][getMealTime(timestamp)];
    const time = timestamp.getTime();
    if (!eatersInMeal.includes(time)) {
      eatersInMeal.push(time);
    }

    // console.log(day);
    // console.log(data);

    await this.persistor.save(data);
  }

  public async getTotals(now: Date = new Date()): Promise<EaterTotals> {
    const data = await this.persistor.getData();

    return computeTotals(now, data);
  }

  public async getTotalsByDay(): Promise<Record<string, number>> {
    const data = await this.persistor.getData();

    return data.reduce<Record<string, number>>((totals, day) => {
      totals[day.date] = convertDayToList(day).length;
      return totals;
    }, {});
  }

  public async getAllLogsForDays(days: string[]): Promise<EatLog[]> {
    const data = await this.persistor.getData();

    return data.reduce<EatLog[]>(
      (logs, day) => (days.includes(day.date) ? logs.concat(convertDayToList(day)) : logs),
      [],
    );
  }
}
