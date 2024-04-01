import { browser } from '$app/environment';

let resolveSetup: (value: IDBDatabase | PromiseLike<IDBDatabase>) => void;
let rejectSetup: (err: unknown) => void;
let setup: Promise<IDBDatabase> = new Promise((res, rej) => {
	resolveSetup = res;
	rejectSetup = rej;
});

export function setupDb(): void {
	if (!browser) {
		// Not on client; skip
		console.log('Cannot load DB');
		return;
	}

	if (!('indexedDB' in window)) {
		alert("This browser doesn't support IndexedDB.");
		throw new Error("This browser doesn't support IndexedDB.");
	}

	const request = window.indexedDB.open('emfkitchen-eaters', 1);

	request.onerror = (event) => {
		rejectSetup(event);
	};
	request.onsuccess = (event) => {
		resolveSetup(request.result);
	};
	request.onupgradeneeded = (event) => {
		const db = (event.target as IDBOpenDBRequest).result;

		if (!db.objectStoreNames.contains('eaters')) {
			db.createObjectStore('eaters', {
				keyPath: 'timestamp'
			});
		}
	};
}

export async function addEntry(timestamp: Date, type: 'volunteer' | 'orga'): Promise<void> {
	if (!browser) {
		return;
	}
	const db = await setup;

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
