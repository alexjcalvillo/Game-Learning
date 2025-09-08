import { defineComponent } from '../core/component'

export type ToolData = {
    name: string
    miningDamage: number // specific damage per mining tick
}

export const Tool = defineComponent<ToolData>('Tool', () => ({
    name: 'Wooden Pickaxe',
    miningDamage: 1,
}))

