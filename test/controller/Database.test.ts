import assert from 'node:assert/strict'
import { before, beforeEach, suite, test } from 'node:test'

import Database from '../../src/controller/Database.ts'
import { getUnixTimestamp } from '../../src/helpers/index.ts'
import { PublishedStateType } from '../../src/types/types.ts'

let db: Database

suite('Database', () => {
  before(async () => {
    // Create the database and tables
    db = new Database(await Database.open(':memory:'))
    await db.db.exec('DELETE FROM PublishedEntry;')
  })

  test('SQL error handling', async () => {
    const err19 = { errno: 19 }
    const err20 = { errno: 20 }
    const err0 = { message: 'foo bar' }

    assert.ok(Database.isSQLError(err19), '19 is a SQL error')
    assert.ok(Database.isSQLError(err20), '20 is a SQL error')
    assert.ok(!Database.isSQLError(err0), 'foo bar is not a SQL error')
  })

  suite('Query', async () => {
    const fiveDaysInFuture = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    const fiveDaysInPast = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)

    const entries = [
      {
        // Available now
        game_id: '1',
        game_name: 'test1',
        published: PublishedStateType.NONE,
        in_future: 0,
        end_date: getUnixTimestamp(fiveDaysInFuture),
      },
      {
        // Available now
        game_id: '2',
        game_name: 'test2',
        published: PublishedStateType.NONE,
        in_future: 0,
        end_date: getUnixTimestamp(fiveDaysInFuture),
      },
      {
        // Available in the future
        game_id: '3',
        game_name: 'test3',
        published: PublishedStateType.NONE,
        in_future: 1,
        end_date: getUnixTimestamp(fiveDaysInFuture),
      },
      {
        // Available in the future
        game_id: '4',
        game_name: 'test4',
        published: PublishedStateType.NONE,
        in_future: 1,
        end_date: getUnixTimestamp(fiveDaysInFuture),
      },
    ] as const

    test('(insert) should insert 4 new entries', async () => {
      for (const entry of entries) {
        try {
          const res = await db.query.insert({
            game_id: entry.game_id,
            game_name: entry.game_name,
            published: entry.published,
            in_future: entry.in_future === 1,
            end_date: entry.end_date,
          })
          assert.ok(res.changes === 1, 'Entry inserted')
        } catch (_err) {
          assert.fail('Entry not inserted')
        }
      }

      assert.deepEqual(await db.db.get('SELECT COUNT(*) FROM PublishedEntry'), {
        'COUNT(*)': 4,
      })
    })

    test('(insert) should not insert new entries', async () => {
      for (const entry of entries) {
        try {
          const res = await db.query.insert({
            game_id: entry.game_id,
            game_name: entry.game_name,
            published: entry.published,
            in_future: entry.in_future === 1,
            end_date: entry.end_date,
          })
          assert.ok(res.changes === 0, 'Entry not inserted')
        } catch (_err) {
          assert.fail('Entry not inserted')
        }
      }

      assert.deepEqual(await db.db.get('SELECT COUNT(*) FROM PublishedEntry'), {
        'COUNT(*)': 4,
      })
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
      const result = await db.query.getByGameId(entries[0].game_id)

      assert.ok(result, 'Result should not be undefined')
      assert.equal(
        result.game_id,
        entries[0].game_id,
        'Game ID should be equal',
      )
    })

    test('(updatePublishedStateByGameId) & (isPublished) should update the published status by game id', async () => {
      const result1 = await db.query.getByGameId(entries[0].game_id)
      assert.ok(result1, 'Result should not be undefined')

      const result2 = await db.query.getPublishedState(entries[0].game_id)
      assert.equal(
        result2,
        PublishedStateType.NONE,
        'should be 0 (PublishedStateType.NONE)',
      )

      await db.query.updatePublishedStateById(
        result1?.id,
        PublishedStateType.PUBLISHED,
      )

      const result3 = await db.query.getPublishedState(entries[0].game_id)
      assert.equal(
        result3,
        PublishedStateType.PUBLISHED,
        'should be 1 (PublishedStateType.PUBLISHED)',
      )
    })
  })
})
