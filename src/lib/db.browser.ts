import type { DatabasePersistor, EaterDay } from '$lib/db.class';
import { Database } from '$lib/db.class';

const LOCAL_STORAGE_DATA_KEY = 'eaterData';

export function createBrowserDatabase(): Database {
  const persistor: DatabasePersistor = {
    async getData(): Promise<EaterDay[]> {
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
          JSON.stringify({ data, error }),
        );
        return [];
      }
    },
    async save(data: EaterDay[]): Promise<void> {
      localStorage.setItem(LOCAL_STORAGE_DATA_KEY, JSON.stringify(data));
    },
  };

  return new Database(persistor);
}
