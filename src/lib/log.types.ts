import { EaterType } from '$lib/EaterType.type';

export interface StoreEaterRequestBody {
  logs: EatLog[];
}

export interface EatLog {
  timestamp: number;
  type: EaterType;
}
