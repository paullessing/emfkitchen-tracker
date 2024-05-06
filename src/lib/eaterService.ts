import type { StoreEaterRequestBody } from '$lib/log.types';
import db from '$lib/db.browser';
import type { EaterType } from '$lib/EaterType.type';

export class EaterService {
  public async logEater(type: EaterType): Promise<void> {
    const now = new Date();

    // console.log('about to add', value);
    await db.addEntry(now, type);

    const body: StoreEaterRequestBody = {
      logs: [
        {
          type,
          timestamp: now.getTime(),
        },
      ],
    };

    try {
      const res = await fetch('/api/eat', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const { success, totals: remoteTotals } = (await res.json()) as {
        success: boolean;
        totals: Record<string, number>;
      };

      if (!success) {
        console.error('No success');
        return;
      }

      const localTotals = await db.getTotalsByDay();

      const localDays = new Set(Object.keys(localTotals));
      console.log(localTotals, remoteTotals);
      for (const [day, remoteCount] of Object.entries(remoteTotals)) {
        // console.log(`Day ${day}, Count: ${remoteCount}, Remote data: ${remoteTotals[day]}`);
        if (localDays.has(day) && remoteCount >= localTotals[day]) {
          localDays.delete(day);
        }
      }
      // localDays contains list of days we need to synchronise
      if (localDays.size > 0) {
        const dataToSync = await db.getAllLogsForDays(Array.from(localDays.values()));
        console.log('days', [...localDays.values()], dataToSync);
        await fetch('/api/eat', {
          method: 'POST',
          body: JSON.stringify({ logs: dataToSync } as StoreEaterRequestBody),
        });
      }
    } catch (error) {
      console.warn('Failed to submit data to backend:', error);
    }
  }
}

export default new EaterService();
