import { browser } from '$app/environment';
import type { Database } from '$lib/db.class';

export async function setupDatabase(): Promise<Database> {
  if (browser) {
    const { createBrowserDatabase } = await import('$lib/db.browser');
    console.log('browser db');
    return createBrowserDatabase();
  } else {
    const { createServerDatabase } = await import('$lib/db.server');
    return createServerDatabase();
  }
}
