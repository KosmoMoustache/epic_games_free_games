export default abstract class AComponent {
  static ComponentType = {
    BUTTON: 2,
  } as const

  constructor() {
    if (this.constructor === AComponent) {
      throw new TypeError(
        'Abstract class "AComponent" cannot be instantiated directly',
      )
    }
  }

  abstract toJSON(): unknown
  abstract toString(): string
}
