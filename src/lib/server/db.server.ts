import type { DatabasePersistor, EaterDay } from '$lib/db.class';
import { Database } from '$lib/db.class';
import fs from 'fs/promises';
import { join } from 'path';
import { env } from '$env/dynamic/private';
import { addLogsToDays, convertDaysToLogs } from '$lib/dataStorage.util';

export default createDb();

export function createDb(): Database {
  const dbPath = join(env.DATABASE_DIR, 'db.json');

  let data: EaterDay[];

  const persistor: DatabasePersistor = {
    async getData(): Promise<EaterDay[]> {
      if (data) {
        return data;
      }

      try {
        const rawData = await fs.readFile(dbPath, 'utf8');
        console.log('read:', data);

        return JSON.parse(rawData || '[]');
      } catch (e) {
        if ((e as { code: string }).code === 'ENOENT') {
          console.log('File does not exist');
          return [];
        } else {
          throw e;
        }
      }
    },
    async save(newData): Promise<void> {
      const logs = convertDaysToLogs(newData);
      data = addLogsToDays(logs, data);

      console.log('write', data);
      await fs.writeFile(dbPath, JSON.stringify(data));
    },
  };

  return new Database(persistor);
}
