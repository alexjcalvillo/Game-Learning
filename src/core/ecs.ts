// ECS-lite
// Entities are numbers. Components identified by unique symbols.
// World stores a Map<Entity, Data> for each component type.
// Systems are update(world, dt) functions (or classes with update(dt) method)

/**
 *  ECS-lite
 *  Entities are numbers. Components identified by unique symbols.
 *  World stores a Map<Entity, Data> for each component type.
 *  Systems are update(world, dt) functions (or classes with update(dt) method)
 *         ┌─────────────────┐
 *         │     World       │
 *         │─────────────────│
 *         │ Entities        │
 *         │ Components      │
 *         │ Queries         │
 *         │                 │
 *         │ coreBus  (ECS)  │───▶ [CoreEvents]
 *         │ gameBus  (Game) │───▶ [GameEvents]
 *         │ uiBus    (UI)   │───▶ [UIEvents]
 *         └─────────────────┘
 *                  │
 *      ┌───────────┼─────────────┐
 *      │           │             │
 * ┌─────────┐ ┌──────────┐ ┌───────────┐
 * │ Systems │ │ UI Layer │ │ Game Logic│
 * └─────────┘ └──────────┘ └───────────┘
 */

// helper to create unique component keys with nice debu names
import { CoreEvents } from './enums'
import {
    ComponentKey,
    ComponentSchema,
    ComponentsOf,
    CoreEventsPayload,
    Entity,
    EventHandler,
    GameEventsPayload,
    UIEventsPayload,
} from './types'
import { EventBus } from './event-bus'

export function createComponent<T>(name: string): ComponentKey<T> {
  return Symbol(name) as ComponentKey<T>
}


export interface System {
    init?(world: World): void
    update(world: World, dt: number): void
    destroy?(world: World): void
}
export class World {
    private nextEntityId = 1
    private entities = new Set<Entity>()
    /**
     * Tracking the max number of entities created improves performance
     * by maintaining the growth of the array between created/destroyed entities.
     *
     * Entities are created and recycled when destroyed
     * ```lua
     * +------------------+     destroyEntity      +--------------------+
     * |   Active Entity  | ---------------------> |  Recycled ID       |
     * |   (in entities)  |                        | (in freeEntityIds) |
     * +------------------+                        +--------------------+
     *          ^                                            |
     *          |                                            |
     *          +---------------- createEntity --------------+
     * ```
     *
     * ```typescript
     * const e1 = world.createEntity(); // 1
     * const e2 = world.createEntity(); // 2
     * const e3 = world.createEntity(); // 3
     *
     * world.destroyEntity(e2); // 2 goes into queue
     * world.destroyEntity(e3); // 3 goes into queue
     *
     * const e4 = world.createEntity(); // reuses 2 (FIFO)
     * const e5 = world.createEntity(); // reuses 3 (FIFO)
     * const e6 = world.createEntity(); // allocates new ID: 4
     * ```
     *
     * @private
     */
    private freeEntityIds: number[] = []

    private components = new Map<ComponentKey<any>, Map<Entity, any>>()

    // Event Buses
    private coreBus = new EventBus<CoreEventsPayload>()
    private gameBus = new EventBus<GameEventsPayload>()
    private uiBus = new EventBus<UIEventsPayload>()

    private systems: System[] = []

    public createEntity(): Entity {
        const id = this.getNextEntityId()
        this.entities.add(id)
        this.emitCore(CoreEvents.ENTITY_CREATED, { entity: id })
        return id
    }

    private getNextEntityId(): Entity {
        if (this.freeEntityIds.length > 0) {
            return this.freeEntityIds.shift()!
        } else {
            return this.nextEntityId++
        }
    }

    public destroyEntity(entity: Entity): void {
        if (!this.entities.has(entity)) return

        // remove all components for this entity
        for (const [schemaKey, store] of this.components.entries()) {
            store.delete(entity)
            this.emitCore(CoreEvents.COMPONENT_REMOVED, { entity, component: schemaKey })
        }

        this.entities.delete(entity)
        this.freeEntityIds.push(entity)
        this.emitCore(CoreEvents.ENTITY_DESTROYED, { entity })
    }

    private ensureStore<T>(schema: ComponentSchema<T>): Map<Entity, T> {
        let store = this.components.get(schema.key)
        if (!store) {
            store = new Map<Entity, T>()
            this.components.set(schema.key, store)
        }

        return store
    }

    public addComponent<T>(
        entity: Entity,
        schema: ComponentSchema<T>,
        data: Partial<T> = {} as T,
    ): T {
        const store = this.ensureStore(schema).set(entity, data)

        const instance = { ...schema.defaults(), ...data } as T
        store.set(entity, instance)
        this.emitCore(CoreEvents.COMPONENT_ADDED, { entity, key: schema.key, component: instance })
        return instance
    }

    public getComponent<T>(entity: Entity, schema: ComponentSchema<T>): T | undefined {
        const store = this.components.get(schema.key) as Map<Entity, T>
        return store.get(entity)
    }

    public removeComponent<T>(entity: Entity, schema: ComponentSchema<T>): void {
        const store = this.components.get(schema.key) as Map<Entity, T> | undefined
        store?.delete(entity)

        this.emitCore(CoreEvents.COMPONENT_REMOVED, { entity, component: schema.key })
    }

    public hasComponent<T>(entity: Entity, key: ComponentKey<T>): boolean {
        const store = this.components.get(key) as Map<Entity, T> | undefined
        return store?.has(entity) ?? false
    }

    public query(...schemas: ComponentSchema<any>[]): Entity[] {
        if (schemas.length === 0) return []

        // start from the smallest store to minimize iterations
        const stores = schemas.map(key => this.ensureStore(key))
        stores.sort((a, b) => a.size - b.size)
        const [smallest, ...rest] = stores

        const result: Entity[] = []
        for (const entity of smallest.keys()) {
            let ok = true
            for (const store of rest) {
                if (!store.has(entity)) {
                    ok = false
                    break
                }
            }

            if (ok) {
                result.push(entity)
            }
        }

        return result
    }

    public queryAll<const Keys extends readonly ComponentSchema<any>[]>(
        ...keys: Keys
    ): Array<[Entity, ...ComponentsOf<Keys>]> {
        const entities = this.query(...keys)
        return entities.map(entity => [
            entity,
            ...keys.map(k => this.getComponent(entity, k)),
            ]
        )
    }

    // --- Systems ---
    public registerSystem(system: System): void {
        this.systems.push(system)
        if (system.init) {
            system.init(this)
        }
    }

    public update(delta: number): void {
        for (const system of this.systems) {
            system.update(this, delta)
        }
    }

    // --- Core Bus ---
    public onCore<K extends keyof CoreEventsPayload>(type: K, handler: EventHandler<K, CoreEventsPayload>): () => void {
        return this.coreBus.on(type, handler)
    }

    public emitCore<K extends keyof CoreEventsPayload>(type: K, payload?: CoreEventsPayload[K]): void {
        this.coreBus.emit(type, payload)
    }

    // --- Game Bus ---
    public onGame<K extends keyof GameEventsPayload>(type: K, handler: EventHandler<K, GameEventsPayload>): () => void {
        return this.gameBus.on(type, handler)
    }

    public emitGame<K extends keyof GameEventsPayload>(type: K, payload?: GameEventsPayload[K]): void {
        this.gameBus.emit(type, payload)
    }

    // --- UI Bus ---
    public onUI<K extends keyof UIEventsPayload>(type: K, handler: EventHandler<K, UIEventsPayload>): () => void {
        return this.uiBus.on(type, handler)
    }

    public emitUI<K extends keyof UIEventsPayload>(type: K, payload?: UIEventsPayload[K]): void {
        this.uiBus.emit(type, payload)
    }
}
