import { describe, it, expect } from 'bun:test';
import { World } from '../../src/core/ecs';
import { Position, Mineable, Inventory } from '../../src/components';
import { ResourceType } from '../../src/components/Mineable'

describe('Component System', () => {
    it("applies defaults when no values are provided", () => {
        const world = new World();
        const player = world.createEntity();
        const inv = world.addComponent(player, Inventory);

        expect(inv.items).toEqual({
            [ResourceType.ORE]: 0,
            [ResourceType.COAL]: 0,
            [ResourceType.GOLD]: 0,
        });
        expect(world.getComponent(player, Inventory)).toEqual({
            items: {
                [ResourceType.ORE]: 0,
                [ResourceType.COAL]: 0,
                [ResourceType.GOLD]: 0,
            },
        });
    });

    it("merges overrides with defaults", () => {
        const world = new World()
        const rock = world.createEntity()
        const pos = world.addComponent(rock, Position, { x: 5 })

        expect(pos).toEqual({ x: 5, y: 0 } as any)
    })

    it("queries multiple components correctly", () => {
        const world = new World()
        const rock = world.createEntity()
        world.addComponent(rock, Position, { x: 1, y: 2 })
        world.addComponent(rock, Mineable, { resourceType: ResourceType.ORE })

        const results = world.queryAll(Position, Mineable)

        expect(results.length).toBe(1)
        const [entity, pos, mineable] = results[0]
        expect(entity).toBe(rock)
        expect(pos).toEqual({ x: 1, y: 2 })
        expect(mineable).toEqual({ resourceType: ResourceType.ORE, hp: 10, maxHp: 10 } as any)
    })
})

