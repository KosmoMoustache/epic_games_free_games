import axios from 'axios'
import logger from '../logger.js'
import { discordTimestampType, type keyImage } from '../types/index.js'
import { discordTimestamp } from '../utils.js'

type ImageField = { url: string }
interface ImageEmbed {
  url: string
  image: ImageField
}
interface DiscordWebhookData {
  content: string
  username: string
  embeds?: DiscordWebhookEmbeds[]
  avatar_url?: string
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
  title: string
  username: string
  url: string
  description: string
  images: ImageEmbed[]
  footer: string
  timestamp: string
  avatar_url?: string
  constructor() {
    this.images = []

    this.title = '[Epic Games]'
    this.username = 'Game Deals'
    this.description = ''
    this.url = 'https://store.epicgames.com/fr/'
    this.footer = ''
    this.timestamp = ''
    this.avatar_url =
      'https://raw.githubusercontent.com/KosmoMoustache/epic_games_free_games/main/profile_picture.png'
  }

  /**
   * Add images embeds to the final webhook
   * @param imageEmbed
   */
  addImages(imageEmbed: ImageEmbed) {
    this.images.push(imageEmbed)
  }

  /**
   * Send the webhook to the specified url
   * @param url Webhook url
   */
  async send(url: string): Promise<void> {
    await axios.post(url, {
      ...this.build(),
    })
  }

  private build(): DiscordWebhookData {
    const template: DiscordWebhookData = {
      content: '',
      username: this.username,
      avatar_url: this.avatar_url,
      embeds: [
        {
          title: this.title,
          description: this.description,
          url: this.url,
          footer: {
            text: this.footer,
          },
          timestamp: this.timestamp,
        },
      ],
    }

    if (this.images.length >= 2) {
      // biome-ignore lint/style/noNonNullAssertion: embeds is declared just above
      template.embeds!.push(...this.images)
    } else {
      // biome-ignore lint/style/noNonNullAssertion: embeds is declared just above
      template.embeds![0].image = {
        url: this.images[0].image.url,
      }
    }

    return template
  }

  /**
   * Return the correct image type
   * @param keyImages
   * @param index Index of the image embed
   * @param total Total of images embeds
   * @pram url Url of the embed. It need to be the same for the embeds to be displayed in the same message
   */
  static ImageEmbed(
    keyImages: keyImage[],
    index: number,
    total: number,
    url = 'https://store.epicgames.com/fr/',
  ): ImageEmbed {
    let keyImage: keyImage

    const getDefaultImage = () => {
      keyImage = keyImages[0]
      logger.debug('No image found, using default wide image')
    }

    switch (total) {
      case 1: {
        keyImage = keyImages.filter(f => f.type === 'OfferImageTall')[0]
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
        url: keyImage.url,
      },
    }
  }

  static formatDescription(
    title: string,
    date1: Date,
    date2: Date,
    pageSlug?: string,
  ): string {
    return `**${title}**: du ${discordTimestamp(
      date1,
      discordTimestampType.f,
    )} au ${discordTimestamp(date2, discordTimestampType.f)} ${
      pageSlug ? `https://store.epicgames.com/fr/p/${pageSlug}` : ''
    }\n`
  }
}
