import { EventHandler } from './types'

export class EventBus<E extends Record<string, any>> {
    private listeners = new Map<keyof E, Set<(payload: any) => void>>()

    // Event API
    public on<K extends keyof E>(eventType: K, handler: EventHandler<K, E>): () => void {
        let set = this.listeners.get(eventType)
        if (!set) {
            set = new Set()
            this.listeners.set(eventType, set)
        }

        set.add(handler)
        return () => {
            set!.delete(handler)
            if (set!.size === 0) {
                this.listeners.delete(eventType)
            }
        }
    }

    public off<K extends keyof E>(eventType: K, handler: EventHandler<K, E>): void {
        const set = this.listeners.get(eventType)
        set?.delete(handler)

        if (set && set.size === 0) {
            this.listeners.delete(eventType)
        }
    }

    public emit<K extends keyof E>(eventType: K, payload?: E[K]): void {
        const set = this.listeners.get(eventType)
        if (!set) return

        // snapshot to avoid mutation issues while iterating
        const handlers = Array.from(set)
        for (const handler of handlers) {
            try {
                handler(payload)
            } catch (error) {
                console.error(`Error in event handler: ${eventType} ${error}`)
            }
        }
    }
}
