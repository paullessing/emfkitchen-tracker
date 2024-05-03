import type { DatabasePersistor, EaterDay } from '$lib/db.class';
import { Database } from '$lib/db.class';
import fs from 'fs/promises';

export function createServerDatabase(): Database {
  const persistor: DatabasePersistor = {
    async getData(): Promise<EaterDay[]> {
      try {
        const data = await fs.readFile('/db/db.json', 'utf8');
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
      await fs.writeFile('/db/db.json', JSON.stringify(data));
    },
  };

  return new Database(persistor);
}
