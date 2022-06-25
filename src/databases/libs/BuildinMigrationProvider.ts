/* eslint-disable import/named */

import {
  Migration,
  MigrationProvider,
} from 'kysely'
import { migrations } from '../Database'

export class BuildinMigrationProvider implements MigrationProvider {
  // eslint-disable-next-line require-await
  async getMigrations (): Promise<Record<string, Migration>> {
    return migrations
  }
}
