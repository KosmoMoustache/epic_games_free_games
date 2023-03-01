import { Database, open, ISqlite } from 'sqlite';
import sqlite3 from 'sqlite3';
import { TableEntry, ParsedElement, SQLError, UnwrapPromise } from './types';

sqlite3.verbose();

export async function openDB() {
  const db = await open({
    filename: './db/database.db',
    driver: sqlite3.cached.Database,
  });

  await db.migrate({
    table: 'entry',
    migrationsPath: './db/migrations/',
  });
  return db;
}

type RequestResult = Promise<ISqlite.RunResult<sqlite3.Statement>> | never;

class DB {
  private db: Database<sqlite3.Database, sqlite3.Statement>;
  tableName = 'PromoEntry';

  constructor(db: Database<sqlite3.Database, sqlite3.Statement>) {
    this.db = db;
  }

  get getDB() {
    return this;
  }

  async getAll(): Promise<TableEntry[] | undefined> {
    return await this.db.all(`SELECT * FROM ${this.tableName}`);
  }
  async getById(id: string): Promise<TableEntry | undefined> {
    return await this.db.get(
      `SELECT * FROM ${this.tableName} WHERE element_id = ? OR id = ?`,
      id,
      id
    );
  }

  /**
   * select all entries that are not published
   * @param state default to false
   * @param and Object that contains optional sql statement and statements params to add to the query
   */
  async getNotPublished(
    state = false,
    and: {
      sql: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any[];
    }
  ): Promise<TableEntry[] | undefined> {
    if (and) {
      return await this.db.all(
        `SELECT * FROM ${this.tableName} WHERE published = ? ` + and.sql,
        state,
        ...and.data
      );
    }
    return await this.db.all(
      `SELECT * FROM ${this.tableName} WHERE published = ?`,
      state
    );
  }

  async insert(id: string, data: ParsedElement): RequestResult {
    return await this.db.run(
      `INSERT INTO ${this.tableName} (element_id, element) VALUES (?, ?)`,
      id,
      JSON.stringify(data)
    );
  }
  /**
   * Update the `published` state of the given entry id
   * @param id entry id
   * @param state default to true
   * @returns
   */
  async updatePublishedState(id: string | number, state = true): RequestResult {
    return await this.db.run(
      `UPDATE ${this.tableName} SET published = ? WHERE element_id = ? OR id = ?`,
      state,
      id,
      id
    );
  }
  /**
   * Update `inFuture` state of the given entry id
   * @param id entry id
   * @param inFuture default to true
   */
  async updateInFuture(id: string | number, inFuture = true): RequestResult {
    return await this.db.run(
      `UPDATE ${this.tableName} SET inFuture = ? WHERE element_id = ? OR id = ?`,
      inFuture,
      id,
      id
    );
  }
  async updateById(id: string | number, data: ParsedElement): RequestResult {
    return await this.db.run(
      `UPDATE ${this.tableName} SET element = ? WHERE element_id = ? OR id = ?`,
      JSON.stringify(data),
      id,
      id
    );
  }
  async deleteById(id: string): RequestResult {
    return await this.db.run(
      `DELETE ${this.tableName} WHERE element_id = ? or id = ?`,
      id,
      id
    );
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
    callback: K
  ): Promise<UnwrapPromise<ReturnType<K>> | undefined> {
    try {
      return await callback();
    } catch (err) {
      if ((err as SQLError).errno) {
        // Handle SQL error
        const error = err as SQLError;
        if (error.errno == 19) {
          const where = error.message.split(':');
          console.info(`Duplicate entry in${where[where.length - 1]}`);
        }
        return;
      }
      console.error(err);
      return;
    }
  }
}

export default DB;
