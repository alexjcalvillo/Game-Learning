import { Inventory, InventoryData } from '../components/Inventory'
import { ResourceType } from '../components/Mineable'
import { System, World } from '../core/ecs'
import { Tool } from '../components/Tool'
import { getPlayerByComponents } from '../helpers'

type Recipe = {
    name: string
    cost: Partial<Record<keyof InventoryData, number>>
    result: { name: string, miningDamage: number } // currently tied to mining - @todo make extensible
}

const recipes: Recipe[] = [
    {
        name: 'Stone Pickaxe',
        cost: { [ResourceType.ORE]: 5 },
        result: { name: 'Stone Pickaxe', miningDamage: 2 }
    },
    {
        name: 'Iron Pickaxe',
        cost: { [ResourceType.COAL]: 5, [ResourceType.ORE]: 5 },
        result: { name: 'Iron Pickaxe', miningDamage: 3 }
    },
    {
        name: 'Golden Pickaxe',
        cost: { [ResourceType.GOLD]: 3 },
        result: { name: 'Golden Pickaxe', miningDamage: 5 }
    },
]

export class CraftingSystem implements System {
    private pendingCraft: Recipe | null = null

    public constructor() {
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            console.debug(`Key pressed: ${event.key}`)
            if (event.key === '1') this.pendingCraft = recipes[0]
            if (event.key === '2') this.pendingCraft = recipes[1]
            if (event.key === '3') this.pendingCraft = recipes[2]
        })
    }
    public update(world: World): void {
        if (!this.pendingCraft) return

        const player = getPlayerByComponents(world)
        if (!player) return

        const inventory = world.getComponent(player, Inventory)!
        const tool = world.getComponent(player, Tool)!

        const recipe = recipes.find(r => r.name === this.pendingCraft?.name)
        if (!recipe) return

        // check resources
        let canCraft = true
        for (const [resourceType, amount] of Object.entries(recipe.cost)) {
            if (inventory[resourceType as keyof InventoryData] < amount) {
                canCraft = false
                break
            }
        }

        if (canCraft) {
            // subtract resources
            for (const [resourceType, amount] of Object.entries(recipe.cost)) {
                inventory[resourceType as keyof InventoryData] -= amount
            }

            // give tool
            tool.name = recipe.result.name
            tool.miningDamage = recipe.result.miningDamage
            // world.addComponent(player, Tool, recipe.result)
            console.debug(`Crafted ${recipe.name} and added to the players inventory.`)
        }

        this.pendingCraft = null
    }
}
