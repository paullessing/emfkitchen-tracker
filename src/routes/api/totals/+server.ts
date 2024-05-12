import { json } from '@sveltejs/kit';
import db from '$lib/server/db.server';

export async function GET(event: { request: Request }): Promise<Response> {
  // console.log(event);
  const totals = await db.getTotals(new Date());
  console.log('Totals', totals);
  return json(totals);
}
