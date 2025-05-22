export default abstract class ALayoutComponent {
  static ComponentType = {
    ACTION_ROW: 1,
    SECTION: 9,
    SEPARATOR: 14,
    CONTAINER: 17,
  } as const

  constructor() {
    if (this.constructor === ALayoutComponent) {
      throw new TypeError(
        'Abstract class "ALayoutComponent" cannot be instantiated directly',
      )
    }
  }

  abstract toJSON(): unknown
  abstract toString(): string
}
