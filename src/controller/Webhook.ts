import axios from 'axios'
import { discordTimestamp } from '../helpers/index.ts'
import { logger } from '../index.ts'
import Logger from '../services/logger.ts'
import { DiscordTimestampType, type KeyImage } from '../types/types.ts'
import type AbstractComponent from './webhook/AbstractComponent.ts'
import type AbstractLayoutComponent from './webhook/AbstractLayoutComponent.ts'

type ImageField = { url: string }
interface ImageEmbed {
  url: string
  image: ImageField
}
interface DiscordWebhookData {
  content: string
  username: string
  avatar_url?: string
  embeds: DiscordWebhookEmbeds[]
  components?: AbstractLayoutComponent[]
}
interface DiscordWebhookEmbeds extends Partial<ImageEmbed> {
  title?: string
  description?: string
  color?: string
  footer?: {
    text: string | Date
  }
  timestamp?: string
}

export default class WebhookBuilder {
  static logger = Logger.getLogger('WebhookBuilder')
  #title: string
  #username: string
  #url: string
  #description: string
  #images: ImageEmbed[]
  #avatar_url?: string
  #components: AbstractComponent[]
  constructor() {
    this.#images = []

    this.#title = '[Epic Games]'
    this.#username = 'Game Deals'
    this.#description = ''
    this.#url = 'https://store.epicgames.com/'
    this.#avatar_url =
      'https://raw.githubusercontent.com/KosmoMoustache/epic_games_free_games/main/profile_picture.png'
    this.#components = []
  }

  get description() {
    return this.#description
  }

  get images() {
    return this.#images
  }

  get components() {
    return this.#components
  }

  /**
   * Add images embeds to the final webhook
   * @param imageEmbed
   */
  addImages(imageEmbed: ImageEmbed) {
    this.#images.push(imageEmbed)
  }

  appendDescription(description: string) {
    this.#description += description
  }

  addComponent(component: AbstractComponent): void {
    this.#components.push(component)
  }

  /**
   * Send the webhook to the specified url
   * @param url Webhook url
   */
  async send(url: URL): Promise<void> {
    if (this.#components.length >= 1)
      url.searchParams.append('with_components', 'true')
    await axios.post(url.toString(), {
      ...this.build(),
    })
  }

  private build(): DiscordWebhookData {
    const template: DiscordWebhookData = {
      content: '',
      username: this.#username,
      avatar_url: this.#avatar_url,
      embeds: [
        {
          title: this.#title,
          description: this.#description,
          url: this.#url,
          timestamp: new Date().toISOString(),
        },
      ],
      components: this.#components.map(component => {
        return component.toJSON() as AbstractLayoutComponent
      }),
    }

    // Add the first image to the first embed
    if (this.#images[0]) {
      // biome-ignore lint/style/noNonNullAssertion: embeds is always at least 1 length
      template.embeds[0]!.image = {
        url: this.#images[0].image.url,
      }
    }

    // Add the rest of the images as separate embeds
    for (let i = 0; i < this.#images.length; i++) {
      if (i === 0) continue // Skip the first image, already added
      template.embeds.push({
        url: this.#images[i]?.url,
        image: this.#images[i]?.image,
      })
    }

    logger.debug('Sending webhook', template)

    return template
  }

  /**
   * Return the correct image type
   * @param keyImages
   * @param index Index of the image embed
   * @param total Total of images embeds
   * @param url Url of the embed. It need to be the same for the embeds to be displayed in the same message
   */
  static getImageFromIndexAndTotal(
    keyImages: KeyImage[],
    index: number,
    total: number,
    url = 'https://store.epicgames.com/',
  ): ImageEmbed {
    let keyImage: KeyImage | undefined

    const getDefaultImage = () => {
      keyImage = keyImages[0]
      WebhookBuilder.logger.debug('No image found, using first image available')
    }

    switch (total) {
      case 1: {
        keyImage = keyImages.filter(f => f.type === 'OfferImageWide')[0]
        if (!keyImage) getDefaultImage()
        break
      }
      case 2: {
        keyImage = keyImages.filter(f => f.type === 'OfferImageTall')[0]
        if (!keyImage) getDefaultImage()
        break
      }
      case 3: {
        if (index === 1) {
          keyImage = keyImages.filter(f => f.type === 'OfferImageWide')[0]
          if (!keyImage) getDefaultImage()
          break
        }
        keyImage = keyImages.filter(f => f.type === 'OfferImageWide')[0]
        if (!keyImage) getDefaultImage()
        break
      }
      case 4: {
        keyImage = keyImages.filter(f => f.type === 'OfferImageWide')[0]
        if (!keyImage) getDefaultImage()
        break
      }
      default: {
        keyImage = keyImages.filter(f => f.type === 'OfferImageWide')[0]
        if (!keyImage) getDefaultImage()
        break
      }
    }

    return {
      url: url,
      image: {
        // biome-ignore lint/style/noNonNullAssertion: there is always at least one image
        url: keyImage!.url,
      },
    }
  }

  static formatDescription(
    title: string,
    date_from: Date,
    date_to: Date,
    pageSlug?: string,
  ): string {
    return `**${title}**: du ${discordTimestamp(
      date_from,
      DiscordTimestampType.f,
    )} au ${discordTimestamp(date_to, DiscordTimestampType.f)} ${
      pageSlug ? `https://store.epicgames.com/p/${pageSlug}` : ''
    }\n`
  }
}
