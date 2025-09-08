import { System, World } from '../core/ecs'
import { Inventory, Mineable, Position, Size } from '../components'
import { getPlayerByComponents } from '../helpers'
import { Tool } from '../components/Tool'
import { GameEvents } from '../core/enums'

const ROCK_COLOR_MAP = {
    ore: '#8b5a2b',
    coal: '#444',
    gold: '#daa520'
} as const

export class RenderSystem implements System {
    private uiState: {
        inventory: { ore: number, coal: number, gold: number }
    } = {
        inventory: { ore: 0, coal: 0, gold: 0 }
    }

    public constructor(private ctx: CanvasRenderingContext2D, world: World) {
        world.onGame(GameEvents.RESOURCE_COLLECTED, ({ resourceType, amount }) => {
            console.debug(`Collected ${amount} ${resourceType}`)
            this.uiState.inventory[resourceType] += amount
        })
    }

    public update(world: World): void {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)

        // Rocks to Mine (With health bar)
        const rocks = world.queryAll(Position, Size, Mineable)
        for (const [_entity, position, size, mineable] of rocks) {
            // rock body
            this.ctx.fillStyle = ROCK_COLOR_MAP[mineable.resourceType]
            this.ctx.fillRect(position.x, position.y, size.width, size.height)

            // Rock HP Bar
            const pad = 2
            const barW = size.width
            const barH = 6
            const pct = mineable.hp / mineable.maxHp

            this.ctx.fillStyle = '#222'
            this.ctx.fillRect(position.x, position.y - (barH + pad), barW, barH)

            this.ctx.fillStyle = '#4caf50'
            this.ctx.fillRect(position.x, position.y - (barH + pad), barW * pct, barH)
        }

        // Inventory
        const player = getPlayerByComponents(world, Inventory, Tool)
        if (!player) return
        const tool = world.getComponent(player, Tool)!

        this.ctx.fillStyle = 'black'
        this.ctx.font = '16px sans-serif'
        this.ctx.fillText(`Ores: ${this.uiState.inventory.ore} Coal: ${this.uiState.inventory.coal} Gold: ${this.uiState.inventory.gold}`, 10, 20)
        this.ctx.fillText(`Tool: ${tool.name} | Mining Damage: ${tool.miningDamage}`, 10, 40)
        this.ctx.fillText(`Press [1] Stone Pickaxe (5 ore) | Press [2] Stone Pickaxe (5 coal) | Press [3] Golden Pickaxe (3 gold)`, 10, 70)
        this.ctx.fillText(``, 10, 90)
    }
}
