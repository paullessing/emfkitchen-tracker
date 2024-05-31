import type { DatabasePersistor, EaterDay } from '$lib/db.class';
import { Database } from '$lib/db.class';
import fs from 'fs/promises';
import fsCb from 'fs';
import { join } from 'path';
import { env } from '$env/dynamic/private';
import Db from 'nedb';

export default createDb();

export function createDb(): Database {
  const db = new Db<EaterDay>({
    filename: join(env.DATABASE_DIR, 'nedb.db'),
    autoload: true,
  });

  const dbPath = join(env.DATABASE_DIR, 'db.json');

  const persistor: DatabasePersistor = {
    async getData(): Promise<EaterDay[]> {
      // try {
      return db.getAllData();

      //   const data = await fs.readFile(dbPath, 'utf8');
      //   console.log('read:', data);
      //
      //   return JSON.parse(data || '[]');
      // } catch (e) {
      //   if ((e as { code: string }).code === 'ENOENT') {
      //     console.log('File does not exist');
      //     return [];
      //   } else {
      //     throw e;
      //   }
      // }
    },
    async save(data): Promise<void> {
      for (const day of data) {
        await new Promise((res, rej) => {
          db.update({ date: day.date }, day, { upsert: true }, (err, data) => {
            if (err) {
              rej(err);
            } else {
              res(data);
            }
          });
        });
      }

      console.log('write', data);
      await fs.writeFile(dbPath, JSON.stringify(data));
    },
  };

  if (!fsCb.existsSync(join(env.DATABASE_DIR, 'nedb.db'))) {
    console.log('File not found, translating');
    const existingData = (() => {
      try {
        const data = fsCb.readFileSync(dbPath, 'utf8');
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
    })();
    persistor.save(existingData);
  }

  return new Database(persistor);
}
