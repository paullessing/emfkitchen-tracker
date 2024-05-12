import type { EaterDay } from '$lib/db.class';
import * as EaterUtils from '$lib/dataStorage.util';
import { addLogsToDays } from '$lib/dataStorage.util';
import type { EatLog } from '$lib/log.types';
import type { EaterTotals } from '$lib/EaterTotals.type';
import { browser } from '$app/environment';

const LOCAL_STORAGE_DATA_KEY = 'eaterData';
const LOCAL_STORAGE_TOTALS_KEY = 'lastServerTotals';

export class BrowserStorage {
  public addLog(log: EatLog): void {
    const days = this.getData();

    const newDays = EaterUtils.addLogToDays(log, days);

    this.save(newDays);
  }

  public getLogsSince(time: number): EatLog[] {
    const data = this.getData();

    const logs = EaterUtils.convertDaysToLogs(data);
    return logs.filter(({ timestamp }) => timestamp > time);
  }

  public setServerTotals(totals: EaterTotals): void {
    localStorage.setItem(LOCAL_STORAGE_TOTALS_KEY, JSON.stringify(totals));
  }

  public getServerTotals(): EaterTotals {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_TOTALS_KEY) ?? 'null';
      const totals = JSON.parse(data);
      if (totals) {
        return totals;
      }
    } catch (e) {
      console.log('Failed to parse local data');
    }
    return {
      timestamp: 0,
      allTime: 0,
      today: 0,
      currentMeal: 0,
    };
  }

  public getTotals(): EaterTotals {
    const serverTotals = this.getServerTotals();
    const unsyncedLogs = this.getLogsSince(serverTotals.timestamp);

    const unsyncedDays = addLogsToDays(unsyncedLogs);
    console.log('getTotals', { serverTotals, unsyncedLogs, unsyncedDays });

    return EaterUtils.computeTotals(new Date(), unsyncedDays, serverTotals);
  }

  public hasUnsyncedLogs(): boolean {
    return this.getUnsyncedLogs().length > 0;
  }

  public getUnsyncedLogs(): EatLog[] {
    return this.getLogsSince(this.getServerTotals().timestamp);
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

class FakeBrowserStorage extends BrowserStorage {
  public getTotals() {
    return { timestamp: 0, today: 0, allTime: 0, currentMeal: 0 };
  }

  public getUnsyncedLogs() {
    return [];
  }

  public hasUnsyncedLogs() {
    return false;
  }

  public getLogsSince() {
    return [];
  }

  public getServerTotals() {
    return { timestamp: 0, today: 0, allTime: 0, currentMeal: 0 };
  }

  public setServerTotals() {}

  public addLog() {}
}

const browserStorage: BrowserStorage = browser ? new BrowserStorage() : new FakeBrowserStorage();

export default browserStorage;
