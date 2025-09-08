export enum CoreEvents {
    ENTITY_CREATED = 'entityCreated',
    ENTITY_DESTROYED = 'entityDestroyed',
    COMPONENT_ADDED = 'componentAdded',
    COMPONENT_REMOVED = 'componentRemoved',
}

export enum GameEvents {
    MINE_ATTEMPT = 'mineAttempt',
    ROCK_DESTROYED = 'rockDestroyed',
    ENTITY_DESTROYED = 'entityDestroyed',
    RESOURCE_COLLECTED = 'resourceCollected'
}

export enum UIEvents {
    LOG_MESSAGE = 'logMessage',
    INVENTORY_UPDATED = 'inventoryUpdated',
    BUTTON_CLICKED = 'buttonClicked',
}
