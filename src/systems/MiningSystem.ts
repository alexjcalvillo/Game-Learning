import { System, World } from '../core/ecs'
import { GameEvents } from '../core/enums'
import { Inventory, Mineable, Position, Size, Tool } from '../components'
import { getPlayerByComponents } from '../helpers'

export class MiningSystem implements System {
    public constructor(world: World) {
       world.onGame(GameEvents.MINE_ATTEMPT, ({ x, y }) => {
           // check all clickable (Position + Size + Mineable) entities
           const allRocks = world.queryAll(Position, Size, Mineable)

           for (const [entity, position, size, mineable] of allRocks) {

               if (
                   x >= position.x &&
                   x <= position.x + size.width &&
                   y >= position.y &&
                   y <= position.y + size.height
               ) {
                   if (mineable.hp > 0) {
                       const player = getPlayerByComponents(world, Inventory, Tool)
                       if (!player) return

                       const tool = world.getComponent(player, Tool)!
                       mineable.hp = Math.max(0, mineable.hp - tool.miningDamage)
                       console.debug(`Rock mined! HP: ${mineable.hp.toFixed(2)}`)

                       if (mineable.hp <= 0) {
                           // capture position BEFORE destroying entity
                           const rockPosition = { ...position }

                           world.emitGame(GameEvents.ROCK_DESTROYED, {
                               entity,
                               resourceType: mineable.resourceType,
                               position: rockPosition,
                           })

                           world.destroyEntity(entity)
                       }
                   }

                   break // consume click on first hit
               }
           }
       })
    }


    public update(world: World): void {
        // noop - no logic for now
    }
}
