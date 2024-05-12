import type { DayMeals, EaterDay } from '$lib/db.class';
import type { EatLog } from '$lib/log.types';
import type { EaterTotals } from '$lib/EaterTotals.type';

const EaterTypeMap = { volunteer: 'volunteers', orga: 'orga' } as const;

export function computeTotals(
  now: Date,
  data: EaterDay[],
  startingTotals?: EaterTotals,
): EaterTotals {
  const date = getDateString(now);
  const nowMealName = getMealTime(now);

  function reduceMeals(
    dayMeals: DayMeals,
  ): { [key in keyof DayMeals]: number } & { latestDate: number } {
    const latestDate = Math.max(
      0,
      ...dayMeals.breakfast,
      ...dayMeals.lunch,
      ...dayMeals.dinner,
      ...dayMeals.night,
    );
    return {
      breakfast: dayMeals.breakfast.length,
      lunch: dayMeals.lunch.length,
      dinner: dayMeals.dinner.length,
      night: dayMeals.night.length,
      latestDate,
    };
  }

  const totals = data.reduce<EaterTotals>(
    (acc, day) => {
      const orgaMeals = reduceMeals(day.orga);
      const volunteerMeals = reduceMeals(day.volunteers);

      const totals: { [Key in keyof DayMeals]: number } = {
        breakfast: orgaMeals.breakfast + volunteerMeals.breakfast,
        lunch: orgaMeals.lunch + volunteerMeals.lunch,
        dinner: orgaMeals.dinner + volunteerMeals.dinner,
        night: orgaMeals.night + volunteerMeals.night,
      };

      const latestDate = Math.max(orgaMeals.latestDate, volunteerMeals.latestDate);

      const today = totals.breakfast + totals.lunch + totals.dinner + totals.night;

      const allTime = acc.allTime + today;

      return {
        ...acc,
        currentMeal: date === day.date ? totals[nowMealName] : acc.currentMeal,
        today: date === day.date ? today : acc.today,
        allTime,
        timestamp: Math.max(acc.timestamp, latestDate),
      };
    },
    {
      currentMeal: 0,
      today: 0,
      allTime: 0,
      timestamp: 0,
    },
  );

  if (startingTotals) {
    return addTotals(startingTotals, totals);
  } else {
    return totals;
  }
}

/**
 * Data from baseTotals will be added if it matches the date/meal of latestTotals
 * @param baseTotals
 * @param latestTotals
 */
export function addTotals(baseTotals: EaterTotals, latestTotals: EaterTotals): EaterTotals {
  const baseDate = new Date(baseTotals.timestamp);
  const latestDate = new Date(latestTotals.timestamp);
  const matchesDay = getDateString(baseDate) === getDateString(latestDate);
  const matchesMeal = matchesDay && getMealTime(baseDate) === getMealTime(latestDate);

  return {
    timestamp: Math.max(baseTotals.timestamp, latestTotals.timestamp),
    allTime: baseTotals.allTime + latestTotals.allTime,
    today: (matchesDay ? baseTotals.today : 0) + latestTotals.today,
    currentMeal: (matchesMeal ? baseTotals.currentMeal : 0) + latestTotals.currentMeal,
  };
}

export function getAllTimestamps(meals: DayMeals): number[] {
  const mealNames: (keyof DayMeals)[] = ['breakfast', 'lunch', 'dinner', 'night'];
  return mealNames.reduce<number[]>(
    (timestamps, mealName) => timestamps.concat(meals[mealName]),
    [],
  );
}

export function convertDaysToLogs(data: EaterDay[]): EatLog[] {
  return data
    .reduce<EatLog[]>(
      (logs, day) =>
        logs
          .concat(
            getAllTimestamps(day.orga).map((timestamp) => ({
              timestamp,
              type: 'orga',
            })),
          )
          .concat(
            getAllTimestamps(day.volunteers).map((timestamp) => ({
              timestamp,
              type: 'orga',
            })),
          ),
      [],
    )
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Adds the given logs to the EaterDay array, returning the same array.
 * @param logs
 * @param days
 */
export function addLogsToDays(logs: EatLog[], days: EaterDay[] = []): EaterDay[] {
  for (const log of logs) {
    addLogToDays(log, days);
  }
  return days;
}

export function addLogToDays({ timestamp, type }: EatLog, data: EaterDay[] = []): EaterDay[] {
  const datetime = new Date(timestamp);
  const dateString = getDateString(datetime);

  let day = data.find(({ date }) => date === dateString);
  if (!day) {
    day = createNewDay(dateString);
    data.push(day);
    data.sort((a, b) => (a.date < b.date ? -1 : 1));
  }

  const eatersInMeal = day[EaterTypeMap[type]][getMealTime(datetime)];
  if (!eatersInMeal.includes(timestamp)) {
    eatersInMeal.push(timestamp);
    eatersInMeal.sort();
  }

  return data;
}

export function getMealTime(timestamp: Date): keyof DayMeals {
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

export function getDateString(timestamp: Date): string {
  return timestamp.toISOString().replace(/T.*$/, '');
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
