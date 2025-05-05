import type { Database, ISqlite } from 'sqlite'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
import logger from '../logger.ts'
import type {
  PublishedEntryInsert,
  PublishedEntrySelect,
  SQLError,
  UnwrapPromise,
} from '../types/index.ts'
import { getUnixTimestamp } from '../utils.ts'

//?
sqlite3.verbose()

type RequestResult = Promise<ISqlite.RunResult<sqlite3.Statement>> | never

export default class DB {
  db: Database<sqlite3.Database, sqlite3.Statement>
  published: PublishedEntryQuery
  constructor(db: Database<sqlite3.Database, sqlite3.Statement>) {
    this.db = db
    this.published = new PublishedEntryQuery(db)
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
        const error = err as SQLError
        const where = error.message.split(':')
        logger.info(`(SQL Error) Duplicate entry in${where[where.length - 1]}`)
      }

      logger.error('(SQL Error) error', err)
      return
    }
  }

  static isSQLError(err: unknown): boolean {
    if ((err as SQLError).errno) return true
    return false
  }
  static isDuplicateError(err: SQLError): boolean {
    if (err.errno === 19) return true
    return false
  }

  static async openDB(filename = './db/database.db') {
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

class PublishedEntryQuery {
  private tableName = 'PublishedEntry'
  db: Database<sqlite3.Database, sqlite3.Statement>
  constructor(db: Database<sqlite3.Database, sqlite3.Statement>) {
    this.db = db
  }

  async getAll(): Promise<PublishedEntrySelect[] | undefined> {
    return await this.db.all<PublishedEntrySelect[]>(
      `SELECT * FROM ${this.tableName}`,
    )
  }

  /**
   * Return true if the game is not in the database or the the entry with the database has end_date set to 0, return false otherwise
   * @param game_id
   * @returns
   */
  async canBeInserted(
    game_id: PublishedEntryInsert['game_id'],
  ): Promise<boolean> {
    const query = await this.db.get<PublishedEntrySelect>(
      `SELECT * FROM ${this.tableName} WHERE game_id = ?`,
      game_id,
    )

    if (
      query === undefined ||
      (query.end_date < getUnixTimestamp() && query.end_date !== 0)
    ) {
      return true
    }

    return false
  }

  /**
   * @param published false
   * @param in_future false
   * @returns
   */
  async insert(
    game_id: string,
    game_name: string,
    published = false,
    in_future = false,
  ): RequestResult {
    return await this.db.run(
      `INSERT INTO ${this.tableName} (game_id, game_name, published, in_future) VALUES (?, ?, ?, ?)`,
      game_id,
      game_name,
      published,
      in_future,
    )
  }

  /**
   *
   * @param game_id
   * @returns
   */
  async isPublished(
    game_id: PublishedEntrySelect['game_id'],
  ): Promise<boolean> {
    const query = await this.db.get<PublishedEntrySelect>(
      `SELECT published FROM ${this.tableName} WHERE game_id = ? AND end_date = 0`,
      game_id,
    )

    return typeof query !== 'undefined' && query.published === 1
  }

  /**
   *
   * @param game_id
   * @param published
   * @returns
   */
  async updatePublishedStateByGameId(
    game_id: PublishedEntryInsert['game_id'],
    published: PublishedEntryInsert['published'],
  ) {
    return await this.db.run(
      `UPDATE ${this.tableName} SET published = ? WHERE game_id = ? AND end_date = 0`,
      published,
      game_id,
    )
  }

  /**
   * set `end_date` for a game by game_id and where `end_date` is null
   * @param game_id
   * @param published
   * @returns
   */
  async setEndDateByGameId(
    game_id: PublishedEntryInsert['game_id'],
    end_date: PublishedEntryInsert['end_date'],
  ) {
    return await this.db.run(
      `UPDATE ${this.tableName} SET end_date = ? WHERE game_id = ? AND end_date = 0`,
      end_date,
      game_id,
    )
  }
}
