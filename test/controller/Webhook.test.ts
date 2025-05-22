import assert from 'node:assert/strict'
import { suite, test, todo } from 'node:test'

import WebhookBuilder from '../../src/controller/Webhook.ts'
import ActionRowComponent from '../../src/controller/webhook/ActionRowComponent.ts'
import ButtonComponent from '../../src/controller/webhook/ButtonComponent.ts'

suite('WebhookBuilder', { skip: false }, () => {
  test('should create WebhookBuilder instance', () => {
    const wb = new WebhookBuilder()
    assert.ok(wb)
  })

  suite('(addImages)', () => {
    const wb = new WebhookBuilder()

    test('should have one image to the WebhookBuilder', () => {
      const imageEmbed = {
        url: 'https://example.com/image1.png',
        image: { url: 'https://example.com/image1.png' },
      }
      wb.addImages(imageEmbed)

      assert.strictEqual(wb.images.length, 1)
      // biome-ignore lint/style/noNonNullAssertion: test
      assert.strictEqual(wb.images[0]!.url, imageEmbed.url)
      // biome-ignore lint/style/noNonNullAssertion: test
      assert.strictEqual(wb.images[0]!.image.url, imageEmbed.image.url)
    })

    test('should add one images to the WebhookBuilder and have 2 in total', () => {
      const imageEmbed = {
        url: 'https://example.com/image2.png',
        image: { url: 'https://example.com/image2.png' },
      }
      wb.addImages(imageEmbed)
      assert.strictEqual(wb.images.length, 2)
      // biome-ignore lint/style/noNonNullAssertion: test
      assert.strictEqual(wb.images[1]!.url, imageEmbed.url)
      // biome-ignore lint/style/noNonNullAssertion: test
      assert.strictEqual(wb.images[1]!.image.url, imageEmbed.image.url)
    })
  })

  suite('(appendDescription)', () => {
    test('should append text to description', () => {
      const wb = new WebhookBuilder()
      wb.appendDescription('Hello')
      assert.strictEqual(wb.description, 'Hello')
    })

    test('should text should be added to the description not replaced', () => {
      const wb = new WebhookBuilder()

      wb.appendDescription('Hello')
      wb.appendDescription('World')
      assert.strictEqual(wb.description, 'HelloWorld')
    })
  })

  suite('(addComponent)', () => {
    test('should add a component to the WebhookBuilder', () => {
      const wb = new WebhookBuilder()
      const arc = new ActionRowComponent().addComponents([
        new ButtonComponent({
          style: ButtonComponent.ButtonStyle.LINK,
          emoji: {
            name: 'ℹ️',
          },
          label: "Plus d'informations",
          url: 'https://s.kosmo.ovh/egfg-add',
        }),
      ])
      wb.addComponent(arc)

      assert.strictEqual(wb.components.length, 1)
      assert.deepEqual(wb.components, [arc])
    })
  })

  suite('(getImageFromIndexAndTotal)', () => {
    const keyImage = [
      {
        type: 'OfferImageWide',
        url: 'https://example.com/OfferImageWide.png',
      },
      {
        type: 'OfferImageTall',
        url: 'https://example.com/OfferImageTall.png',
      },
    ]

    test('should return the wide image when total is 1', () => {
      const r = WebhookBuilder.getImageFromIndexAndTotal(keyImage, 0, 1)
      assert.strictEqual(r.image.url, keyImage[0]?.url)
    })
    test('should return the tall image when total is 2', () => {
      const r = WebhookBuilder.getImageFromIndexAndTotal(keyImage, 0, 2)
      assert.strictEqual(r.image.url, keyImage[1]?.url)
    })
    test('should return the wide image when total is 3 and index 1', () => {
      const r = WebhookBuilder.getImageFromIndexAndTotal(keyImage, 1, 3)
      assert.strictEqual(r.image.url, keyImage[0]?.url)
    })
    test('should return the wide image when total is 3 and index != 1', () => {
      const r = WebhookBuilder.getImageFromIndexAndTotal(keyImage, 0, 3)
      assert.strictEqual(r.image.url, keyImage[0]?.url)
    })
    test('should return the wide image when total is 4', () => {
      const r = WebhookBuilder.getImageFromIndexAndTotal(keyImage, 0, 4)
      assert.strictEqual(r.image.url, keyImage[0]?.url)
    })
    test('should return the wide image when total is >4', () => {
      const r = WebhookBuilder.getImageFromIndexAndTotal(keyImage, 0, 5)
      assert.strictEqual(r.image.url, keyImage[0]?.url)
    })
    test('should return the default image when no image found', () => {
      const keyImage = [
        {
          type: 'Thumbnail',
          url: 'https://example.com/image1.png',
        },
        {
          type: 'VaultClosed',
          url: 'https://example.com/image1.png',
        },
        {
          type: 'DieselStoreFrontWide',
          url: 'https://example.com/image1.png',
        },
      ]
      const r = WebhookBuilder.getImageFromIndexAndTotal(keyImage, 0, 2)
      assert.strictEqual(r.image.url, keyImage[0]?.url)
    })
  })

  test('(formatDescription) should format description with two dates', () => {
    const title = 'Game Title'
    const date1 = new Date('2023-01-01')
    const date2 = new Date('2023-12-31')
    const r = WebhookBuilder.formatDescription(title, date1, date2)
    assert.strictEqual(
      r,
      `**${title}**: du <t:1672531200:f> au <t:1703980800:f> \n`,
    )
  })

  suite('send', () => {
    // TODO
    todo('implement this test (should build the webhook and send it)')
  })
})
