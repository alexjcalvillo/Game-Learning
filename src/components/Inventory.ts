import { createComponent } from '../core/ecs';
import { ResourceType } from './Mineable'
import { defineComponent } from '../core/component'

export type InventoryData = {
    items: {
        [key in ResourceType]: number
    }
}

// helper to make an empty bag
export function createEmptyInventory(): InventoryData {
    return {
        items: {
            ore: 0,
            coal: 0,
            gold: 0
        }
    }
}

export const Inventory = defineComponent<InventoryData>('Inventory', createEmptyInventory)
