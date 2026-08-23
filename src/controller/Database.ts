import { mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { getUnixTimestamp } from '../helpers/index.ts'
import logger from '../services/logger.ts'
import type {
  Migrations,
  ProviderName,
  PubGame,
  PubGameInsert,
  PubGameSelect,
  PublishedStateType,
  SQLError,
} from '../types/types.ts'

type RunResult = {
  changes: number | bigint
  lastInsertRowid: number | bigint
}

export default class DB {
  static #logger = logger.getLogger('Database')
  db: DatabaseSync
  query: Query
  constructor(db: DatabaseSync) {
    this.db = db
    this.query = new Query(db)
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
      CREATE TABLE IF NOT EXISTS migrations (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL UNIQUE,
        applied_at  INTEGER NOT NULL
      );
    `)

    const applied = new Set(
      (db.prepare('SELECT name FROM migrations').all() as Migrations[]).map(
        row => row.name,
      ),
    )

    const migrationsPath = './db/migrations/'
    const files = readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort()

    for (const file of files) {
      if (applied.has(file)) continue
      const up = extractUp(readFileSync(join(migrationsPath, file), 'utf-8'))
      db.exec(up)
      db.prepare('INSERT INTO migrations (name, applied_at) VALUES (?, ?)').run(
        file,
        getUnixTimestamp(),
      )
      DB.#logger.info('Applied migration', file)
    }
  }

  async logQueryAll() {
    DB.#logger.table(this.query.getAll())
  }
}

/**
 * Extract the `-- Up` section of a migration file
 */
export function extractUp(sql: string): string {
  const upStart = sql.indexOf('-- Up')
  const downStart = sql.indexOf('-- Down', upStart)
  if (upStart === -1 || downStart === -1) return sql
  return sql.slice(upStart, downStart)
}

class Query {
  static logger = logger.getLogger('DB:Query')
  db: DatabaseSync
  constructor(db: DatabaseSync) {
    this.db = db
  }

  insert({
    provider,
    game_id,
    game_name,
    pub_status,
    in_future,
    end_date,
  }: PubGameInsert): RunResult {
    return this.db
      .prepare(
        `INSERT INTO PubGame (provider, game_id, game_name, end_date, pub_status, in_future)
         SELECT ?, ?, ?, ?, ?, ?
         WHERE NOT EXISTS (
          SELECT 1 FROM PubGame
          WHERE provider = ? AND game_id = ?
            AND (end_date = 0 OR end_date > ?)
          )`,
      )
      .run(
        provider,
        game_id,
        game_name,
        end_date,
        pub_status,
        in_future ? 1 : 0,
        provider,
        game_id,
        getUnixTimestamp(),
      )
  }

  getByGameId(
    provider: ProviderName,
    game_id: PubGame['game_id'],
  ): PubGameSelect | undefined {
    return this.db
      .prepare(
        `SELECT * FROM PubGame
         WHERE provider = ? AND game_id = ? ORDER BY id DESC`,
      )
      .get(provider, game_id) as PubGameSelect | undefined
  }

  getPublishedState(
    provider: ProviderName,
    game_id: PubGame['game_id'],
  ): PublishedStateType | undefined {
    const row = this.db
      .prepare(
        `SELECT pub_status FROM PubGame
         WHERE provider = ? AND game_id = ? ORDER BY id DESC LIMIT 1`,
      )
      .get(provider, game_id) as Pick<PubGameSelect, 'pub_status'> | undefined
    return row?.pub_status
  }

  updatePubStatusById(
    id: PubGame['id'],
    pub_status: PubGame['pub_status'],
  ): RunResult {
    return this.db
      .prepare(`UPDATE PubGame SET pub_status = ? WHERE id = ?`)
      .run(pub_status, id)
  }

  getAll(): PubGameSelect[] {
    return this.db
      .prepare(`SELECT * FROM PubGame ORDER BY id DESC`)
      .all() as PubGameSelect[]
  }
}
