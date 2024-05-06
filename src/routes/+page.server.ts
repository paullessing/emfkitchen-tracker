import db from '$lib/server/db.server';
import type { EaterTotals } from '$lib/db.class';

export async function load({ params }): Promise<{ totals: EaterTotals }> {
  return {
    totals: await db.getTotals(new Date()),
  };
}
