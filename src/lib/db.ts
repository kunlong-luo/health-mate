import Dexie, { type EntityTable } from 'dexie';

export interface ReportRecord {
  id: string; // The taskId
  result: any; // the JSON payload
  createdAt: Date;
}

const db = new Dexie('HealthMateDB') as Dexie & {
  reports: EntityTable<ReportRecord, 'id'>;
};

// Schema declaration
db.version(1).stores({
  reports: 'id, createdAt' 
});

export { db };
