import db from '$lib/server/db.server';
import type { EaterTotals } from '$lib/db.class';

export async function load({ params }): Promise<{ totals: EaterTotals }> {
  return {
    totals: {
      allTime: 0,
      today: 0,
      currentMeal: 0,
      timestamp: 0
    }
  }
  // return {
  //   totals: await db.getTotals(new Date()),
  // };
}
