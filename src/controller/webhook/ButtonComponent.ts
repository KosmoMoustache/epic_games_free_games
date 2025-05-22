import AbstractComponent from './AbstractComponent.ts'

type ButtonStructure = {
  type: number
  id?: number
  style: number
  label?: string
  emoji?: { name: string }
  custom_id?: string
  url?: string
  disabled?: boolean
}

type ButtonBase = {
  type: 2
  style: (typeof ButtonComponent.ButtonStyle)[keyof typeof ButtonComponent.ButtonStyle]
  label?: string
  emoji?: { name: string }
  custom_id?: string
  url?: string
  disabled?: boolean
}

type ButtonComponentOptions = {
  style: typeof ButtonComponent.ButtonStyle.LINK
  url: string
} & Omit<ButtonStructure, 'custom_id' | 'type'>

export default class ButtonComponent extends AbstractComponent {
  static ButtonStyle = {
    PRIMARY: 1,
    SECONDARY: 2,
    SUCCESS: 3,
    DANGER: 4,
    LINK: 5,
  } as const

  #struc: ButtonBase

  constructor(args: ButtonComponentOptions) {
    super()
    this.#struc = {
      type: AbstractComponent.ComponentType.BUTTON,
      ...args,
    }
  }

  override toString() {
    return JSON.stringify(this.toJSON())
  }

  override toJSON() {
    return this.#struc
  }
}
