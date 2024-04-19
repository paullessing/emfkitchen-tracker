import { browser } from '$app/environment';
import type { Database } from './Database.interface';
import { BrowserDatabase } from './db.browser';

export function setupDatabase(): Database {
	if (!browser) {
		return {
			async addEntry() {},
			async getTotals() {
				return { currentMeal: 0, today: 0, allTime: 0 };
			}
		};
	} else {
		return new BrowserDatabase();
	}
}
