import type { EatLog } from '$lib/log.types';

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

    const dateString = this.getDateString(timestamp);

    let day = data.find(({ date }) => date === dateString);
    if (!day) {
      day = createNewDay(dateString);
      data.push(day);
      data.sort((a, b) => (a.date < b.date ? -1 : 1));
    }

    const eatersInMeal = day[EaterTypeMap[type]][this.getMealTime(timestamp)];
    const time = timestamp.getTime();
    if (!eatersInMeal.includes(time)) {
      eatersInMeal.push(time);
    }

    console.log(day);
    console.log(data);

    await this.persistor.save(data);
  }

  public async getTotals(now: Date = new Date()): Promise<EaterTotals> {
    const data = await this.persistor.getData();
    const date = this.getDateString(now);
    const nowMealName = this.getMealTime(now);

    function reduceMeals(dayMeals: DayMeals): { [key in keyof DayMeals]: number } {
      return {
        breakfast: dayMeals.breakfast.length,
        lunch: dayMeals.lunch.length,
        dinner: dayMeals.dinner.length,
        night: dayMeals.night.length,
      };
    }

    return data.reduce(
      (acc, day) => {
        const orgaMeals = reduceMeals(day.orga);
        const volunteerMeals = reduceMeals(day.volunteers);

        const totals: { [Key in keyof DayMeals]: number } = {
          breakfast: orgaMeals.breakfast + volunteerMeals.breakfast,
          lunch: orgaMeals.lunch + volunteerMeals.lunch,
          dinner: orgaMeals.dinner + volunteerMeals.dinner,
          night: orgaMeals.night + volunteerMeals.night,
        };

        const today = totals.breakfast + totals.lunch + totals.dinner + totals.night;

        const allTime = acc.allTime + today;

        return {
          currentMeal: date === day.date ? totals[nowMealName] : acc.currentMeal,
          today: date === day.date ? today : acc.today,
          allTime,
        };
      },
      {
        currentMeal: 0,
        today: 0,
        allTime: 0,
      },
    );
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

  private getMealTime(timestamp: Date): keyof DayMeals {
    const hour = timestamp.getHours();

    if (hour >= 6 && hour < 12) {
      return 'breakfast';
    } else if (hour >= 12 && hour < 18) {
      return 'lunch';
    } else if (hour >= 18) {
      return 'dinner';
    } else {
      return 'night';
    }
  }

  private getDateString(timestamp: Date): string {
    return timestamp.toISOString().replace(/T.*$/, '');
  }
}
