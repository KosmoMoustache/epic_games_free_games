import assert from 'node:assert/strict'
import { suite, test } from 'node:test'
import ActionRowComponent from '../../../src/controller/webhook/ActionRowComponent.ts'
import ButtonComponent from '../../../src/controller/webhook/ButtonComponent.ts'

suite('ActionRowComponent', () => {
  test('should create ActionRowComponent instance', () => {
    const arc = new ActionRowComponent()
    assert.ok(arc)
  })

  test('should add a component to the ActionRowComponent', () => {
    const arc = new ActionRowComponent()
    const btn = new ButtonComponent({
      style: ButtonComponent.ButtonStyle.LINK,
      url: 'https://example.com',
      label: 'Example',
    })
    arc.addComponent(btn)
    assert.strictEqual(arc.toJSON().components.length, 1)
  })

  test('should add 5 ButtonComponent', () => {
    const arc = new ActionRowComponent()
    const btns = Array.from(
      { length: 5 },
      () =>
        new ButtonComponent({
          style: ButtonComponent.ButtonStyle.LINK,
          url: 'https://example.com',
          label: 'Example',
        }),
    )

    arc.addComponents(btns)
    assert.strictEqual(arc.toJSON().components.length, 5)
  })

  test('should throw an error when adding more than 5 components', () => {
    const arc = new ActionRowComponent()
    const btns = Array.from(
      { length: 6 },
      () =>
        new ButtonComponent({
          style: ButtonComponent.ButtonStyle.LINK,
          url: 'https://example.com',
          label: 'Example',
        }),
    )

    assert.throws(
      () => {
        arc.addComponents(btns)
      },
      {
        message: 'ActionRowComponent can only have 5 components',
      },
    )
  })

  test('should convert ActionRowComponent to JSON', () => {
    const expected = {
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          url: 'https://example.com',
          label: 'Example',
        },
      ],
    }
    const arc = new ActionRowComponent()
    const btn = new ButtonComponent({
      style: ButtonComponent.ButtonStyle.LINK,
      url: 'https://example.com',
      label: 'Example',
    })
    arc.addComponent(btn)
    const json = arc.toJSON()
    assert.deepEqual(json, expected)
  })

  test('should convert ActionRowComponent to string', () => {
    const expected = JSON.stringify({
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          url: 'https://example.com',
          label: 'Example',
        },
      ],
    })
    const arc = new ActionRowComponent()
    const btn = new ButtonComponent({
      style: ButtonComponent.ButtonStyle.LINK,
      url: 'https://example.com',
      label: 'Example',
    })
    arc.addComponent(btn)
    const str = arc.toString()
    assert.strictEqual(str, expected)
  })
})
