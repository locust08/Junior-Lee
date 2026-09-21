import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260713_014914 from './20260713_014914';
import * as migration_20260713_134849_payload_six_globals from './20260713_134849_payload_six_globals';
import * as migration_20260717_021900_approved_metro_frontend_schema from './20260717_021900_approved_metro_frontend_schema';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260713_014914.up,
    down: migration_20260713_014914.down,
    name: '20260713_014914',
  },
  {
    up: migration_20260713_134849_payload_six_globals.up,
    down: migration_20260713_134849_payload_six_globals.down,
    name: '20260713_134849_payload_six_globals',
  },
  {
    up: migration_20260717_021900_approved_metro_frontend_schema.up,
    down: migration_20260717_021900_approved_metro_frontend_schema.down,
    name: '20260717_021900_approved_metro_frontend_schema',
  },
];
