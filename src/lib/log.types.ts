export interface StoreEaterRequestBody {
  logs: EatLog[];
}

export interface EatLog {
  timestamp: number;
  type: 'volunteer' | 'orga';
}