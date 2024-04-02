import { browser } from '$app/environment';

interface Database {
	addEntry(timestamp: Date, type: 'volunteer' | 'orga'): Promise<void>;
	getTotals(): Promise<{ currentMeal: number; today: number; allTime: number }>;
}

export function setupDatabase(): Database {
	if (!browser) {
		return {
			async addEntry() {},
			async getTotals() {
				return { currentMeal: 0, today: 0, allTime: 0 };
			}
		};
	} else {
		const db = setupDb();

		return {
			addEntry: applyDb(db, addEntry),
			async getTotals() {
				return { currentMeal: 0, today: 0, allTime: 0 };
			}
		};
	}
}

function applyDb<Args extends unknown[], ReturnType>(
	db: Promise<IDBDatabase>,
	func: (db: IDBDatabase, ...args: Args) => Promise<ReturnType>
): (...args: Args) => Promise<ReturnType> {
	return async (...args: Args) => func.apply(null, [await db, ...args]);
}

function setupDb(): Promise<IDBDatabase> {
	if (!('indexedDB' in window)) {
		alert("This browser doesn't support IndexedDB.");
		throw new Error("This browser doesn't support IndexedDB.");
	}

	return new Promise((resolve, reject) => {
		const request = window.indexedDB.open('emfkitchen-eaters', 1);

		request.onerror = (event) => {
			reject(event);
		};
		request.onsuccess = (event) => {
			console.log('DB Setup successful');
			resolve(request.result);
		};
		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			if (!db.objectStoreNames.contains('eaters')) {
				db.createObjectStore('eaters', {
					keyPath: 'timestamp'
				});
			}
		};
	});
}

export async function addEntry(
	db: IDBDatabase,
	timestamp: Date,
	type: 'volunteer' | 'orga'
): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const transaction = db.transaction(['eaters'], 'readwrite');

		transaction.oncomplete = () => resolve();
		transaction.onerror = reject;

		transaction.objectStore('eaters').add({
			timestamp: timestamp.getTime(),
			type
		});
	});
}
