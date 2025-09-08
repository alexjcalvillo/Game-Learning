import { defineComponent } from '../core/component'

export type SizeData = { width: number; height: number }
export const Size = defineComponent<SizeData>('Size', () => ({ width: 0, height: 0 }))
