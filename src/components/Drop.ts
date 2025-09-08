import { ResourceType } from './Mineable'
import { defineComponent } from '../core/component'

export type DropData = {
    resourceType: ResourceType
    amount: number
}

export const Drop = defineComponent<DropData>('Drop', () => ({
    resourceType: ResourceType.ORE,
    amount: 1,
}))
