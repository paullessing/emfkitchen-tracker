import type { DatabasePersistor, DayMeals, EaterDay } from '$lib/db.class';
import { Database } from '$lib/db.class';
import { createNewDay, EaterTypeMap } from '$lib/dataStorage.util';
import type { EaterType } from '$lib/EaterType.type';
import Datastore from '@seald-io/nedb';
import { join } from 'path';
import { env } from '$env/dynamic/private';

export default await createDb();

export async function createDb(): Promise<Database> {
  const store = new Datastore<EaterDay>({
    filename: join(env.DATABASE_DIR, 'nedb.db'),
    autoload: true,
  });

  await store.ensureIndexAsync({ fieldName: 'date', unique: true });

  const persistor: DatabasePersistor = {
    async getData(): Promise<EaterDay[]> {
      return store.findAsync({});
    },

    async addMealEntry(
      date: string,
      type: EaterType,
      meal: keyof DayMeals,
      timestamp: number,
    ): Promise<void> {
      try {
        await store.insertAsync(createNewDay(date));
      } catch (e: unknown) {
        if ((e as { errorType?: string }).errorType !== 'uniqueViolated') throw e;
      }
      await store.updateAsync(
        { date },
        { $addToSet: { [`${EaterTypeMap[type]}.${meal}`]: timestamp } },
      );
    },
  };

  return new Database(persistor);
}
