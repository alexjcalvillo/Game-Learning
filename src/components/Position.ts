import { defineComponent } from '../core/component'

export type PositionData = { x: number; y: number }
export const Position = defineComponent<PositionData>('Position', () => ({ x: 0, y: 0 }))
