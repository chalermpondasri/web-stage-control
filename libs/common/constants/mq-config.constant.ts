export enum EXCHANGES {
    EVENT_BUS = 'event_bus',
    TRACK_DL = 'track_dead_letter_exchange',
}

export enum QUEUES {
    TRACK_CREATE = 'track_create_queue',
    TRACK_UPDATE = 'track_update_queue',
    TRACK_DELETE = 'track_delete_queue',
    TRACK_DL = 'track_dead_letter_queue',
}
