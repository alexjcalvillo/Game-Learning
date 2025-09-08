import { defineComponent } from '../core/component'

export enum ResourceType {
    ORE = 'ore',
    COAL = 'coal',
    GOLD = 'gold',
}

const resourceTypeMaxHealth = {
    [ResourceType.ORE]: 10,
    [ResourceType.COAL]: 15,
    [ResourceType.GOLD]: 25,
}

export type MineableData = {
    hp: number
    maxHp: number
    resourceType: ResourceType
}

export const Mineable = defineComponent<MineableData>('Mineable', () => ({
    resourceType: ResourceType.ORE,
    hp: resourceTypeMaxHealth[ResourceType.ORE],
    maxHp: resourceTypeMaxHealth[ResourceType.ORE],
}))
