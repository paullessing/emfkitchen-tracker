import { json } from '@sveltejs/kit';
import db from '$lib/server/db.server';

export async function GET(event: { request: Request }): Promise<Response> {
  const totals = db.getTotals(new Date());
  return json(totals);
}
