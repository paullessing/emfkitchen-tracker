import type { DatabasePersistor, EaterDay } from '$lib/db.class';
import { Database } from '$lib/db.class';
import Datastore from '@seald-io/nedb';
import { join } from 'path';
import { env } from '$env/dynamic/private';

export default await createDb();

export async function createDb(): Promise<Database> {
  const store = new Datastore<EaterDay>({
    filename: join(env.DATABASE_DIR, 'nedb.db'),
    autoload: true,
  });

  const persistor: DatabasePersistor = {
    async getData(): Promise<EaterDay[]> {
      return store.findAsync({});
    },

    async save(day: EaterDay): Promise<void> {
      await store.updateAsync({ date: day.date }, day, { upsert: true });
    },
  };

  return new Database(persistor);
}
