import type AbstractComponent from './AbstractComponent.ts'
import AbstractLayoutComponent from './AbstractLayoutComponent.ts'

export type ActionRowStructure = {
  type: number
  id?: number
  components: AbstractComponent[]
}
type ActionRowBase = {
  type: 1
  id?: number
  components: AbstractComponent[]
}

type ActionRowComponentOptions = Omit<ActionRowBase, 'custom_id' | 'type'>

export default class ActionRowComponent extends AbstractLayoutComponent {
  #struc: ActionRowBase
  constructor(args?: ActionRowComponentOptions) {
    super()
    this.#struc = {
      type: AbstractLayoutComponent.ComponentType.ACTION_ROW,
      components: [],
      ...args,
    }
  }

  addComponent(component: AbstractComponent): this {
    this.addComponents([component])
    return this
  }
  addComponents(components: AbstractComponent[]): this {
    this.#struc.components.push(...components)
    this.#test()
    return this
  }

  #test() {
    if (this.#struc.components.length > 5) {
      throw new Error('ActionRowComponent can only have 5 components')
    }
    // TODO: Up to 5 interactive button components or a single select component
  }

  toString() {
    return JSON.stringify(this.toJSON())
  }

  override toJSON() {
    return {
      type: this.#struc.type,
      id: this.#struc.id,
      components: this.#struc.components.map(component => {
        return component.toJSON()
      }),
    } as ActionRowStructure
  }
}
