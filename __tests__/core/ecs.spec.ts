import { describe, it, expect } from 'bun:test';
import { World } from '../../src/core/ecs';
import { Position } from '../../src/components';
import { Entity } from '../../src/core/types'

class TestableWorld extends World {
    public constructor() {
        super()
    }
    public getEntities(): Set<Entity> {
        return (this as any)['entities']
    }
}
describe("Entity lifecycle", () => {
    it("removes components when entity is destroyed", () => {
        const world = new TestableWorld()
        const e = world.createEntity()
        world.addComponent(e, Position, { x: 10, y: 20 })

        expect(world.getComponent(e, Position)).toEqual({ x: 10, y: 20 })

        world.destroyEntity(e)

        expect(world.getComponent(e, Position)).toBeUndefined()
    })

    it("emits componentRemoved events on destruction", () => {
        const world = new TestableWorld()
        const e = world.createEntity()
        world.addComponent(e, Position, { x: 1, y: 2 })

        let removed: number | null = null
        world.onCore("componentRemoved", ({ entity }) => {
            removed = entity
        })

        world.destroyEntity(e)

        expect(removed).toBe(e)
    })

    it("emits entityDestroyed after cleanup", () => {
        const world = new TestableWorld()
        const e = world.createEntity()

        let destroyed: number | null = null
        world.onCore("entityDestroyed", ({ entity }) => {
            destroyed = entity
        })

        world.destroyEntity(e)

        expect(destroyed).toBe(e)
    })

    it("reuses IDs after destruction", () => {
        const world = new TestableWorld()

        const e1 = world.createEntity()
        const e2 = world.createEntity()

        world.destroyEntity(e1)
        const e3 = world.createEntity()

        // e3 should reuse e1's ID
        expect(e3).toBe(e1)

        // e2 should still exist
        expect(world.getEntities().has(e2)).toBe(true)
    })

    it("reuses IDs in FIFO order across multiple deletions", () => {
        const world = new TestableWorld()

        const e1 = world.createEntity()
        const e2 = world.createEntity()
        const e3 = world.createEntity()

        // Destroy e1 first, then e2
        world.destroyEntity(e1)
        world.destroyEntity(e2)

        // Next creation should reuse e1 (oldest freed)
        const e4 = world.createEntity()
        expect(e4).toBe(e1)

        // Next creation should reuse e2 (next-oldest freed)
        const e5 = world.createEntity()
        expect(e5).toBe(e2)

        // e3 was never destroyed, should still exist
        expect(world.getEntities().has(e3)).toBe(true)
    })

})
