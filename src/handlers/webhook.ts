import axios from 'axios';
import { keyImage } from '../types';

type ImageField = { url: string };
interface ImageEmbed {
  url: string;
  image: ImageField;
}
interface DiscordWebhookData {
  content: string;
  username: string;
  embeds?: DiscordWebhookEmbeds[];
  avatar_url?: string;
}
interface DiscordWebhookEmbeds extends Partial<ImageEmbed> {
  title?: string;
  description?: string;
  color?: string;
  footer?: {
    text: string | Date;
  };
  timestamp?: string;
}

export default class WebhookBuilder {
  title: string;
  username: string;
  url: string;
  description: string;
  images: ImageEmbed[];
  footer: string;
  timestamp: string;
  constructor() {
    this.images = [];

    this.title = '[Epic Games]';
    this.username = 'Game Deals';
    this.description = '';
    this.url = 'https://store.epicgames.com/fr/';
    this.footer = '';
    this.timestamp = '';
  }

  /**
   * Add images embeds to the final webhook
   * @param imageEmbed
   */
  addImages(imageEmbed: ImageEmbed) {
    this.images.push(imageEmbed);
  }

  /**
   * Send the webhook to the specified url
   * @param url Webhook url
   */
  async send(url: string): Promise<void> {
    await axios.post(url, {
      ...this.build(),
    });
  }

  private build(): DiscordWebhookData {
    return {
      content: '',
      username: this.username,
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
        ...this.images,
      ],
    };
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
    url = 'https://store.epicgames.com/fr/'
  ): ImageEmbed {
    let keyImage: keyImage;

    switch (total) {
      case 1: {
        keyImage = keyImages.filter((f) => f.type == 'OfferImageTall')[0];
        if (!keyImage) keyImage = keyImages[0];
        break;
      }
      case 2: {
        keyImage = keyImages.filter((f) => f.type == 'OfferImageTall')[0];
        if (!keyImage) keyImage = keyImages[0];
        break;
      }
      case 3: {
        if (index === 1) {
          keyImage = keyImages.filter((f) => f.type == 'OfferImageWide')[0];
          if (!keyImage) keyImage = keyImages[0];
          break;
        }
        keyImage = keyImages.filter((f) => f.type == 'OfferImageWide')[0];
        if (!keyImage) keyImage = keyImages[0];
        break;
      }
      case 4: {
        keyImage = keyImages.filter((f) => f.type == 'OfferImageWide')[0];
        if (!keyImage) keyImage = keyImages[0];
        break;
      }
      default: {
        keyImage = keyImages.filter((f) => f.type == 'OfferImageWide')[0];
        if (!keyImage) keyImage = keyImages[0];
        break;
      }
    }
    return {
      url: url,
      image: {
        url: keyImage.url,
      },
    };
  }
}
