import { createServerDatabase } from '$lib/server/db.server';

export async function load() {
  const db = await createServerDatabase();

  return {
    totals: await db.getTotals(new Date()),
  };
}
