import type { DatabasePersistor, EaterDay } from '$lib/db.class';
import { Database } from '$lib/db.class';
import fs from 'fs/promises';
import { join } from 'path';
import { env } from '$env/dynamic/private';

export default createServerDatabase();

export function createServerDatabase(): Database {
  const dbPath = join(env.DATABASE_DIR, 'db.json');
  const persistor: DatabasePersistor = {
    async getData(): Promise<EaterDay[]> {
      try {
        const data = await fs.readFile(dbPath, 'utf8');
        console.log('read:', data);

        return JSON.parse(data || '[]');
      } catch (e) {
        if ((e as { code: string }).code === 'ENOENT') {
          console.log('File does not exist');
          return [];
        } else {
          throw e;
        }
      }
    },
    async save(data): Promise<void> {
      console.log('write', data);
      await fs.writeFile(dbPath, JSON.stringify(data));
    },
  };

  return new Database(persistor);
}
