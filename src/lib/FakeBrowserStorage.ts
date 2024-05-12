import { BrowserStorage } from '$lib/db.browser';

export class FakeBrowserStorage extends BrowserStorage {
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
