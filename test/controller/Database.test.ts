import assert from 'node:assert/strict'
import { before, suite, test } from 'node:test'

import Database, { extractUp } from '../../src/controller/Database.ts'
import { getUnixTimestamp } from '../../src/helpers/index.ts'
import { Provider, PubStatus } from '../../src/types/types.ts'

let db: Database

suite('Database', () => {
  before(async () => {
    // Create the database and tables
    db = new Database(await Database.open(':memory:'))
    await db.db.exec('DELETE FROM PubGame;')
  })

  test('SQL error handling', async () => {
    const errUnique = { errcode: 2067 }
    const errPrimaryKey = { errcode: 1555 }
    const err0 = { message: 'foo bar' }

    assert.ok(Database.isSQLError(errUnique), '2067 is a SQL error')
    assert.ok(Database.isSQLError(errPrimaryKey), '1555 is a SQL error')
    assert.ok(!Database.isSQLError(err0), 'foo bar is not a SQL error')
    assert.ok(Database.isDuplicateError(errUnique), '2067 is a duplicate error')
    assert.ok(
      Database.isDuplicateError(errPrimaryKey),
      '1555 is a duplicate error',
    )
  })

  suite('extractUp', () => {
    test('returns the Up section when Up and Down markers are present', () => {
      const sql =
        '-- header\n-- Up\nCREATE TABLE a (id INTEGER);\n-- Down\nDROP TABLE a;\n'
      const up = extractUp(sql)
      assert.ok(up.includes('-- Up'), 'keeps the Up marker')
      assert.ok(up.includes('CREATE TABLE a (id INTEGER);'), 'keeps the Up sql')
      assert.ok(!up.includes('-- Down'), 'drops the Down marker')
      assert.ok(!up.includes('DROP TABLE a;'), 'drops the Down sql')
    })

    test('returns the whole sql when the Up marker is missing', () => {
      const sql = '-- Down\nDROP TABLE a;\n'
      assert.equal(extractUp(sql), sql)
    })

    test('returns the whole sql when the Down marker is missing', () => {
      const sql = '-- Up\nCREATE TABLE a (id INTEGER);\n'
      assert.equal(extractUp(sql), sql)
    })

    test('returns the whole sql when both markers are missing', () => {
      const sql = 'CREATE TABLE a (id INTEGER);\n'
      assert.equal(extractUp(sql), sql)
    })
  })

  suite('Query', async () => {
    const fiveDaysInFuture = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)

    const entries = [
      {
        // Available now
        provider: Provider.EPIC,
        game_id: '1',
        game_name: 'test1',
        pub_status: PubStatus.NONE,
        in_future: 0,
        end_date: getUnixTimestamp(fiveDaysInFuture),
      },
      {
        // Available now
        provider: Provider.EPIC,
        game_id: '2',
        game_name: 'test2',
        pub_status: PubStatus.NONE,
        in_future: 0,
        end_date: getUnixTimestamp(fiveDaysInFuture),
      },
      {
        // Available in the future
        provider: Provider.STEAM,
        game_id: '3',
        game_name: 'test3',
        pub_status: PubStatus.NONE,
        in_future: 1,
        end_date: getUnixTimestamp(fiveDaysInFuture),
      },
      {
        // Available in the future
        provider: Provider.STEAM,
        game_id: '4',
        game_name: 'test4',
        pub_status: PubStatus.NONE,
        in_future: 1,
        end_date: getUnixTimestamp(fiveDaysInFuture),
      },
    ] as const

    test('(insert) should insert 4 new entries', async () => {
      for (const entry of entries) {
        try {
          const res = await db.query.insert({
            provider: entry.provider,
            game_id: entry.game_id,
            game_name: entry.game_name,
            pub_status: entry.pub_status,
            in_future: entry.in_future === 1,
            end_date: entry.end_date,
          })
          assert.ok(res.changes === 1, 'Entry inserted')
        } catch (_err) {
          assert.fail('Entry not inserted')
        }
      }

      assert.deepEqual(
        {
          ...(await db.db.prepare('SELECT COUNT(*) FROM PubGame').get()),
        },
        { 'COUNT(*)': 4 },
      )
    })

    test('(insert) should not insert new entries', async () => {
      for (const entry of entries) {
        try {
          const res = await db.query.insert({
            provider: entry.provider,
            game_id: entry.game_id,
            game_name: entry.game_name,
            pub_status: entry.pub_status,
            in_future: entry.in_future === 1,
            end_date: entry.end_date,
          })
          assert.ok(res.changes === 0, 'Entry not inserted')
        } catch (_err) {
          assert.fail('Entry not inserted')
        }
      }

      assert.deepEqual(
        {
          ...(await db.db.prepare('SELECT COUNT(*) FROM PubGame').get()),
        },
        { 'COUNT(*)': 4 },
      )
    })

    test('(getAll) should return all 4 entries by order DESC', async () => {
      const result = await db.query.getAll()
      assert.partialDeepStrictEqual(
        result,
        entries.slice().reverse(),
        'Entries should be equal',
      )
    })

    test('(getByGameId) should return the entry with game_id 1', async () => {
      const result = await db.query.getByGameId(
        entries[0].provider,
        entries[0].game_id,
      )

      assert.ok(result, 'Result should not be undefined')
      assert.equal(
        result.game_id,
        entries[0].game_id,
        'Game ID should be equal',
      )
    })

    test('(updatePubStatusById) & (PubStatus) should update the published status by game id', async () => {
      const result1 = await db.query.getByGameId(
        entries[0].provider,
        entries[0].game_id,
      )
      assert.ok(result1, 'Result should not be undefined')

      const result2 = await db.query.getPublishedState(
        entries[0].provider,
        entries[0].game_id,
      )
      assert.equal(result2, PubStatus.NONE, 'should be 0 (PubStatus.NONE)')

      await db.query.updatePubStatusById(result1?.id, PubStatus.DONE)

      const result3 = await db.query.getPublishedState(
        entries[0].provider,
        entries[0].game_id,
      )
      assert.equal(result3, PubStatus.DONE, 'should be 1 (PubStatus.DONE)')
    })
  })
})
