import { CoreEvents, GameEvents, UIEvents } from './enums'
import { World } from './ecs'

export type Entity = number

// A ComponentKey<T> uniquely identifies a component type T at runtime.
export type ComponentKey<T> = symbol & { __brand?: T }
export interface ComponentSchema<T> {
    key: ComponentKey<T>
    defaults: () => T
}

export type ComponentOf<K> = K extends ComponentSchema<infer T> ? T : never
export type ComponentsOf<Ks extends readonly ComponentSchema<any>[]> = {
    [I in keyof Ks]: ComponentOf<Ks[I]>
}

export type EventHandler<K, E> = (payload?: E[K]) => void

export type CoreEventsPayload = {
    [CoreEvents.ENTITY_CREATED]: { entity: Entity }
    [CoreEvents.ENTITY_DESTROYED]: { entity: Entity }
    [CoreEvents.COMPONENT_ADDED]: { entity: Entity, component: ComponentKey<any> }
    [CoreEvents.COMPONENT_REMOVED]: { entity: Entity, component: ComponentKey<any> }
}

export type GameEventsPayload = {
    [GameEvents.MINE_ATTEMPT]: { x: number, y: number }
    [GameEvents.ROCK_DESTROYED]: {
        entity: Entity
        resourceType: string
        position: { x: number, y: number }
    }
    [GameEvents.RESOURCE_COLLECTED]: {
        entity: Entity
        resourceType: string
        amount: number
    }
    [GameEvents.ENTITY_DESTROYED]: { entity: Entity }
}

export type UIEventsPayload = {
    [UIEvents.BUTTON_CLICKED]: { id: string }
    [UIEvents.LOG_MESSAGE]: { message: string }
    [UIEvents.INVENTORY_UPDATED]: { items: Record<string, number> }
}
