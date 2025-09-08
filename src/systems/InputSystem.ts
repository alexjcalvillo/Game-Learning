import { Inventory, Mineable, Position, Size } from '../components'
import { System, World } from '../core/ecs'
import { Tool } from '../components/Tool'
import { getPlayerByComponents } from '../helpers'
import { GameEvents } from '../core/enums'

export class InputSystem implements System {
    private pendingClick: { x: number; y: number } | null = null

    public constructor(canvas: HTMLCanvasElement) {
        // Listen for clicks
        canvas.addEventListener("click", (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
            this.pendingClick = { x, y }
        })
    }

    public update(world: World): void {
        if (!this.pendingClick) return

        // translate input -> game intent
        world.emitGame(GameEvents.MINE_ATTEMPT, {
            x: this.pendingClick.x,
            y: this.pendingClick.y,
        })

        this.pendingClick = null // consume click
    }
}
