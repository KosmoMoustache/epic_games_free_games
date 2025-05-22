import assert from 'node:assert/strict'
import { suite, test } from 'node:test'

import Logger from '../../src/services/logger.ts'

suite('Logger', { skip: true }, () => {
  test('create a logger instance', () => {
    const logger = new Logger()
    assert.ok(logger)
  })

  test('create a child logger instance', () => {
    const logger = Logger.getLogger('child')
    assert.ok(logger)
  })

  test('print every log level', () => {
    const logger = new Logger()
    assert.doesNotThrow(() => {
      logger.info('info')
      logger.warn('warn')
      logger.error('error')
      logger.debug('debug')
      logger.verbose('verbose')
    })
  })

  test('print table', () => {
    const logger = new Logger()
    const data = [
      {
        id: 298,
        game_id: '497dcba3ecbf4587a2dd5eb0665e6880',
        game_name: 'Game 1',
        published: 1,
        in_future: 0,
        end_date: 1746457200,
      },
      {
        id: 299,
        game_id: '50e14f43dd4e412f864d78943ea28d91',
        game_name: 'Game 2',
        published: 1,
        in_future: 0,
        end_date: 1746716400,
      },
    ]
    assert.doesNotThrow(() => {
      logger.table(data)
    })
  })
})
