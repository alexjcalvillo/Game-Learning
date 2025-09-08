import { World } from './ecs'
import { CraftingSystem, DropSystem, InputSystem, MiningSystem, InventorySystem, RenderSystem } from '../systems'
import { Inventory, Mineable, Position, Size, Tool } from '../components'
import { createEmptyInventory } from '../components/Inventory'
import { ResourceType } from '../components/Mineable'
import { UISystem } from '../systems/UISystem'

export class Game {
    private world = new World()
    private readonly ctx: CanvasRenderingContext2D

    public constructor(private canvas: HTMLCanvasElement) {
        this.ctx = this.canvas.getContext('2d')!

        // Spawn single player into world
        const player = this.spawnPlayer()

        // Systems: input -> logic -> render (ordering important!)
        this.world.registerSystem(new InputSystem(this.canvas))
        this.world.registerSystem(new MiningSystem(this.world))
        this.world.registerSystem(new InventorySystem(this.world, player))
        this.world.registerSystem(new DropSystem())
        this.world.registerSystem(new CraftingSystem())
        this.world.registerSystem(new UISystem(this.world))
        this.world.registerSystem(new RenderSystem(this.ctx, this.world))

        // Spawn rocks
        this.spawnRock(100, 100, 50, 50, 5, ResourceType.COAL)
        this.spawnRock(200, 140, 50, 50, 8, ResourceType.GOLD)
        this.spawnRock(320, 90, 50, 50, 3, ResourceType.ORE)
    }

    private spawnPlayer() {
        const entity = this.world.createEntity()
        this.world.addComponent(entity, Inventory)
        this.world.addComponent(entity, Tool)
        // this.world.addComponent(entity, Position, { x: 100, y: 100 })
        // this.world.addComponent(entity, Size, { width: 50, height: 50 })

        return entity
    }

    private spawnRock(x: number, y: number, width: number, height: number, hp: number, resourceType: ResourceType) {
        const entity = this.world.createEntity()
        this.world.addComponent(entity, Position, { x, y })
        this.world.addComponent(entity, Size, { width, height })
        this.world.addComponent(entity, Mineable, { hp, maxHp: hp, resourceType })
    }

    public start() {
        let lastTime = performance.now()

        const loop = (time: number) => {
            const delta = time - lastTime
            lastTime = time

            this.world.update(delta)

            requestAnimationFrame(loop)
        }

        requestAnimationFrame(loop)
    }
}
