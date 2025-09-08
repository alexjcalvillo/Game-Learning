import { ComponentSchema } from './types'

export function defineComponent<T>(name: string, defaults: () => T): ComponentSchema<T> {
 return {
     key: Symbol(name),
     defaults,
 }
}
