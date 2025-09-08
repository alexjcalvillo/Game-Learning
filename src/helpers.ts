import { World } from './core/ecs'
import { ComponentSchema, Entity } from './core/types'

export function getPlayerByComponents(world: World, ...components: ComponentSchema<any>[]): Entity | undefined {
    const players = world.query(...components)
    if (players.length === 0) return
    return players[0]
}
