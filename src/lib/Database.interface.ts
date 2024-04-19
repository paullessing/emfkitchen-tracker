export interface Database {
	addEntry(timestamp: Date, type: 'volunteer' | 'orga'): Promise<void>;
	getTotals(now: Date): Promise<{ currentMeal: number; today: number; allTime: number }>;
}

export interface EaterTotals {
	currentMeal: number;
	today: number;
	allTime: number;
}
