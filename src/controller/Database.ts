import type { Database, ISqlite } from 'sqlite'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
import { getUnixTimestamp } from '../helpers/index.ts'
import logger from '../services/logger.ts'
import type {
  PublishedEntryInsert,
  PublishedEntrySelect,
  SQLError,
  UnwrapPromise,
} from '../types/types.ts'

// TODO: verbose mode is not working
// sqlite3.verbose()

type RequestResult = Promise<ISqlite.RunResult<sqlite3.Statement>> | never

export default class DB {
  static logger = logger.getLogger('Database')
  db: Database<sqlite3.Database, sqlite3.Statement>
  query: Query
  constructor(db: Database<sqlite3.Database, sqlite3.Statement>) {
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
    return typeof (err as SQLError).errno !== 'undefined'
  }
  static isDuplicateError(err: SQLError): boolean {
    return err.errno === 19
  }

  static async open(filename = './db/database.db') {
    const db = await open({
      filename: filename,
      driver: sqlite3.cached.Database,
    })

    await db.migrate({
      table: 'entry',
      migrationsPath: './db/migrations/',
    })

    return db
  }
}

class Query {
  static logger = logger.getLogger('DB:Query')
  private tableName = 'PublishedEntry'
  db: Database<sqlite3.Database, sqlite3.Statement>
  constructor(db: Database<sqlite3.Database, sqlite3.Statement>) {
    this.db = db
  }

  insert({
    game_id,
    game_name,
    published,
    in_future,
    end_date,
  }: Omit<PublishedEntryInsert, 'id'>): RequestResult {
    return this.db.run(
      `INSERT INTO ${this.tableName} (game_id, game_name, published, in_future, end_date)
       SELECT ?, ?, ?, ?, ?
       WHERE NOT EXISTS (
        SELECT 1 FROM ${this.tableName}
        WHERE game_id = ?
          AND (end_date = 0 OR end_date > ?)
        )`,
      game_id,
      game_name,
      published,
      in_future,
      end_date,
      game_id,
      getUnixTimestamp(),
    )
  }

  async getLastByGameId(
    game_id: PublishedEntrySelect['game_id'],
  ): Promise<PublishedEntrySelect | undefined> {
    return this.db.get<PublishedEntrySelect>(
      `SELECT * FROM ${this.tableName} WHERE game_id = ? ORDER BY id DESC`,
      game_id,
    )
  }

  async isPublished(
    game_id: PublishedEntrySelect['game_id'],
  ): Promise<boolean> {
    return this.db
      .get<Pick<PublishedEntrySelect, 'published'>>(
        `SELECT published FROM ${this.tableName} WHERE game_id = ? ORDER BY id DESC LIMIT 1`,
        game_id,
      )
      .then(query => {
        return typeof query !== 'undefined' && query.published === 1
      })
  }

  async updatePublishedStateById(
    id: PublishedEntryInsert['id'],
    published: PublishedEntryInsert['published'],
  ) {
    return await this.db.run(
      `UPDATE ${this.tableName} SET published = ? WHERE id = ?`,
      published,
      id,
    )
  }

  async getAll(): Promise<PublishedEntrySelect[]> {
    return this.db.all<PublishedEntrySelect[]>(
      `SELECT * FROM ${this.tableName} ORDER BY id DESC`,
    )
  }
}
