import { type Writable, writable } from 'svelte/store';
import { browser } from '$app/environment';
import db, { BrowserStorage } from '$lib/db.browser';
import type { EaterTotals } from '$lib/EaterTotals.type';
import type { EaterType } from '$lib/EaterType.type';
import { FakeBrowserStorage } from '$lib/FakeBrowserStorage';
import type { EatLog, StoreEaterRequestBody } from '$lib/log.types';

const RETRY_SYNC_INTERVAL_SECONDS = 10;

export class EaterService {
  private readonly _eaterTotals: Writable<EaterTotals>;
  public get eaterTotals(): Writable<EaterTotals> {
    return this._eaterTotals;
  }

  private syncInterval: number | null = null;

  private readonly db: BrowserStorage;

  constructor() {
    if (browser) {
      this.db = db;
      this._eaterTotals = writable<EaterTotals>(this.db.getTotals());
    } else {
      this._eaterTotals = writable<EaterTotals>({
        currentMeal: 0,
        today: 0,
        allTime: 0,
        timestamp: 0,
      });
      this.db = new FakeBrowserStorage();
    }

    this.attemptSync().catch(() => this.startSyncAttempts());
  }

  public async getTotals(): Promise<EaterTotals> {
    try {
      const totals: EaterTotals = await (await fetch('/api/totals')).json();

      this._eaterTotals.set(totals);

      return totals;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async logEater(type: EaterType): Promise<void> {
    const now = new Date();
    const eatLog: EatLog = {
      type,
      timestamp: now.getTime(),
    };
    this.db.addLog(eatLog);
    this._eaterTotals.set(this.db.getTotals());

    try {
      await this.attemptSync();
    } catch {
      this.startSyncAttempts();
    }
  }

  private startSyncAttempts(): void {
    this.clearInterval();
    if (browser && this.db.hasUnsyncedLogs()) {
      console.log('Starting sync attempts', this.db.getUnsyncedLogs());
      setInterval(() => this.attemptSync(), RETRY_SYNC_INTERVAL_SECONDS * 1000);
    }
  }

  private async attemptSync(): Promise<void> {
    const logs = this.db.getUnsyncedLogs();
    console.debug(`Attempting to sync with ${logs.length} unsynced logs`);
    if (!logs.length) {
      this.clearInterval();
      return;
    }

    const body: StoreEaterRequestBody = {
      logs,
    };
    const res = await fetch('/api/eat', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as {
      success: boolean;
      totals: EaterTotals;
    };

    if (data.success) {
      this.db.setServerTotals(data.totals);
      this._eaterTotals.set(data.totals);
      this.clearInterval();

      console.log('Successfully synced');
    } else {
      throw new FailedSyncError(data);
    }
  }

  private clearInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

class FailedSyncError extends Error {
  constructor(public readonly data?: unknown) {
    super('Failed to sync');
  }
}

export default new EaterService();
