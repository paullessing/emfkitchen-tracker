import type { DatabasePersistor, EaterDay } from '$lib/db.class';
import { Database } from '$lib/db.class';
import * as EaterUtils from '$lib/dataStorage.util';

const LOCAL_STORAGE_DATA_KEY = 'eaterData';

export class BrowserStorage {
  public logEater(timestamp: Date, type: 'volunteer' | 'orga'): void {
    const days = this.getData();

    const newDays = EaterUtils.addLogToDays({ timestamp: timestamp.getTime(), type }, days);

    this.save(newDays);
  }

  // public getTotals(now: Date): EaterTotals {
  //   const days = this.getData();
  //
  //   return EaterUtils.computeTotals(now, days);
  // }

  private getData(): EaterDay[] {
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
  }

  private save(data: EaterDay[]): void {
    localStorage.setItem(LOCAL_STORAGE_DATA_KEY, JSON.stringify(data));
  }
}



export default createBrowserDatabase();

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
