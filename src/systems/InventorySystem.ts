import { System, World } from '../core/ecs'
import { Inventory } from '../components'
import { Entity } from '../core/types'
import { GameEvents, UIEvents } from '../core/enums'

export class InventorySystem implements System {
    public constructor(world: World, private player: Entity) {
        world.onGame(GameEvents.RESOURCE_COLLECTED, ({ _entity, resourceType, amount }) => {
            const inventory = world.getComponent(this.player, Inventory)
            if (!inventory) return

            inventory[resourceType] += amount

            world.emitUI(UIEvents.INVENTORY_UPDATED, {
                items: inventory.items,
            })
        })
    }

    public update (world: World): void {
        // noop - no logic for now
    }
}

// export class InventorySystem implements System {
//     public update(world: World) {
//         const players = world.query(Inventory)
//         const drops = world.query(Drop)
//
//         if (players.length === 0) return
//         // only ever 1 player currently
//         const player = players[0]
//
//         // get the players associated inventory
//         const inventory = world.getComponent(player, Inventory)!
//
//         for (const drop of drops) {
//             const dropData = world.getComponent(drop, Drop)!
//             inventory[dropData.resourceType] += dropData.amount
//
//             world.destroyEntity(drop) // consume drop
//         }
//     }
// }
