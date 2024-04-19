import type { Database, EaterTotals } from './Database.interface';

const LOCAL_STORAGE_DATA_KEY = 'eaterData';

type Timestamp = number;

interface EaterDay {
	date: String;
	orga: DayMeals;
	volunteers: DayMeals;
}

interface DayMeals {
	breakfast: Timestamp[];
	lunch: Timestamp[];
	dinner: Timestamp[];
	night: Timestamp[];
}

function createNewDay(date: string): EaterDay {
	return {
		date,
		orga: {
			breakfast: [],
			lunch: [],
			dinner: [],
			night: []
		},
		volunteers: {
			breakfast: [],
			lunch: [],
			dinner: [],
			night: []
		}
	};
}

const EaterTypeMap = { volunteer: 'volunteers', orga: 'orga' } as const;

export class BrowserDatabase implements Database {
	public async addEntry(timestamp: Date, type: 'volunteer' | 'orga'): Promise<void> {
		const data: EaterDay[] = this.getDataFromLocalStorage();

		const dateString = this.getDateString(timestamp);

		let day = data.find(({ date }) => date === dateString);
		if (!day) {
			day = createNewDay(dateString);
			data.push(day);
			data.sort((a, b) => (a.date < b.date ? -1 : 1));
		}

		day[EaterTypeMap[type]][this.getMealTime(timestamp)].push(timestamp.getTime());

		console.log(day);
		console.log(data);

		this.writeDataToLocalStorage(data);
	}

	public async getTotals(now: Date = new Date()): Promise<EaterTotals> {
		const data = this.getDataFromLocalStorage();
		const date = this.getDateString(now);
		const nowMealName = this.getMealTime(now);

		function reduceMeals(dayMeals: DayMeals): { [key in keyof DayMeals]: number } {
			return {
				breakfast: dayMeals.breakfast.length,
				lunch: dayMeals.lunch.length,
				dinner: dayMeals.dinner.length,
				night: dayMeals.night.length
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
					night: orgaMeals.night + volunteerMeals.night
				};

				const today = totals.breakfast + totals.lunch + totals.dinner + totals.night;

				const allTime = acc.allTime + today;

				return {
					currentMeal: date === day.date ? totals[nowMealName] : acc.currentMeal,
					today: date === day.date ? today : acc.today,
					allTime
				};
			},
			{
				currentMeal: 0,
				today: 0,
				allTime: 0
			}
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

	private getDataFromLocalStorage(): EaterDay[] {
		const data = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
		try {
			if (data) {
				return JSON.parse(data);
			} else {
				return [];
			}
		} catch (error) {
			localStorage.setItem(
				'eaterData.error.' + new Date().getTime(),
				JSON.stringify({ data, error })
			);
			return [];
		}
	}

	private writeDataToLocalStorage(data: EaterDay[]): void {
		localStorage.setItem(LOCAL_STORAGE_DATA_KEY, JSON.stringify(data));
	}
}
