import { System, World } from '../core/ecs'
import { UIEvents } from '../core/enums'

export class UISystem implements System {
    public constructor(world: World) {
        world.onUI(UIEvents.LOG_MESSAGE, (message) => {
            console.log(`[UI] ${message}`)
        })

        world.onUI(UIEvents.INVENTORY_UPDATED, ({ items }) => {
            console.debug('[UI] - inventory updated', items)
        })
    }

    public update(world: World, dt: number) {
        // noop - no logic for now
        // add animations or UI State transitions here
    }
}
