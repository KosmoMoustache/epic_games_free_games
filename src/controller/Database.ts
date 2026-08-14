import { mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { getUnixTimestamp } from '../helpers/index.ts'
import logger from '../services/logger.ts'
import type {
  ProviderName,
  PublishedEntryInsert,
  PublishedEntrySelect,
  PublishedStateType,
  SQLError,
  UnwrapPromise,
} from '../types/types.ts'

type RunResult = {
  changes: number | bigint
  lastInsertRowid: number | bigint
}

export default class DB {
  static logger = logger.getLogger('Database')
  db: DatabaseSync
  query: Query
  constructor(db: DatabaseSync) {
    this.db = db
    this.query = new Query(db)
  }

  /**
   * Utility function to handle async try catch blocks and handle SQL error duplicate entry
   * @param callback Callback function
   * @example
   * await DB.try(
   *  async () =>
   *   await Promise.all(
   *     parsedElements.map((vl) => {
   *       return db.insert(vl.id, vl);
   *     })
   *   )
   * );
   */
  static async try<K extends () => Promise<UnwrapPromise<ReturnType<K>>>>(
    callback: K,
  ): Promise<UnwrapPromise<ReturnType<K>> | undefined> {
    try {
      return await callback()
    } catch (err) {
      if (DB.isSQLError(err) && DB.isDuplicateError(err as SQLError)) {
        const where = (err as SQLError).message.split(':')
        DB.logger.info(
          `(SQL Error) Duplicate entry in${where[where.length - 1]}`,
        )
      }

      DB.logger.error('(SQL Error) error', err)
      return
    }
  }

  static isSQLError(err: unknown): boolean {
    return typeof (err as SQLError).errcode !== 'undefined'
  }
  static isDuplicateError(err: Pick<SQLError, 'errcode'>): boolean {
    return err.errcode === 2067 || err.errcode === 1555
  }

  static open(filename = './db/database.db'): DatabaseSync {
    mkdirSync(dirname(filename), { recursive: true })

    const db = new DatabaseSync(filename)
    DB.migrate(db)
    return db
  }

  private static migrate(db: DatabaseSync) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS entry (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL UNIQUE,
        applied_at  INTEGER NOT NULL
      );
    `)

    const applied = new Set(
      db
        .prepare('SELECT name FROM entry')
        .all()
        .map(row => row.name),
    )

    const migrationsPath = './db/migrations/'
    const files = readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort()

    for (const file of files) {
      if (applied.has(file)) continue
      const up = extractUp(readFileSync(join(migrationsPath, file), 'utf-8'))
      db.exec(up)
      db.prepare('INSERT INTO entry (name, applied_at) VALUES (?, ?)').run(
        file,
        getUnixTimestamp(),
      )
      DB.logger.info('Applied migration', file)
    }
  }
}

/**
 * Extract the `-- Up` section of a migration file
 */
function extractUp(sql: string): string {
  const upStart = sql.indexOf('-- Up')
  const downStart = sql.indexOf('-- Down', upStart)
  if (upStart === -1 || downStart === -1) return sql
  return sql.slice(upStart, downStart)
}

class Query {
  static logger = logger.getLogger('DB:Query')
  private tableName = 'PublishedEntry'
  db: DatabaseSync
  constructor(db: DatabaseSync) {
    this.db = db
  }

  insert({
    provider,
    game_id,
    game_name,
    published,
    in_future,
    end_date,
  }: Omit<PublishedEntryInsert, 'id'>): RunResult {
    return this.db
      .prepare(
        `INSERT INTO ${this.tableName} (provider, game_id, game_name, published, in_future, end_date)
         SELECT ?, ?, ?, ?, ?, ?
         WHERE NOT EXISTS (
          SELECT 1 FROM ${this.tableName}
          WHERE provider = ? AND game_id = ?
            AND (end_date = 0 OR end_date > ?)
          )`,
      )
      .run(
        provider,
        game_id,
        game_name,
        published,
        in_future ? 1 : 0,
        end_date,
        provider,
        game_id,
        getUnixTimestamp(),
      )
  }

  getByGameId(
    provider: ProviderName,
    game_id: PublishedEntrySelect['game_id'],
  ): PublishedEntrySelect | undefined {
    return this.db
      .prepare(
        `SELECT * FROM ${this.tableName}
         WHERE provider = ? AND game_id = ? ORDER BY id DESC`,
      )
      .get(provider, game_id) as PublishedEntrySelect | undefined
  }

  getPublishedState(
    provider: ProviderName,
    game_id: PublishedEntrySelect['game_id'],
  ): PublishedStateType | undefined {
    const row = this.db
      .prepare(
        `SELECT published FROM ${this.tableName}
         WHERE provider = ? AND game_id = ? ORDER BY id DESC LIMIT 1`,
      )
      .get(provider, game_id) as
      | Pick<PublishedEntrySelect, 'published'>
      | undefined
    return row?.published
  }

  updatePublishedStateById(
    id: PublishedEntryInsert['id'],
    published: PublishedEntryInsert['published'],
  ): RunResult {
    return this.db
      .prepare(`UPDATE ${this.tableName} SET published = ? WHERE id = ?`)
      .run(published, id)
  }

  getAll(): PublishedEntrySelect[] {
    return this.db
      .prepare(`SELECT * FROM ${this.tableName} ORDER BY id DESC`)
      .all() as PublishedEntrySelect[]
  }
}
