export enum EXCHANGES {
    EVENT_BUS = 'event_bus',
    TRACK_DL = 'track_dead_letter_exchange',
    ALBUM_DL = 'album_dead_letter_exchange',
    ANNOUNCEMENT_DL = 'announcement_dead_letter_exchange',
    ARTIST_DL = 'artist_dead_letter_exchange',
    CAMPAIGN_DL = 'campaign_dead_letter_exchange',
}

export enum QUEUES {
    TRACK_CREATE = 'track_create_queue',
    TRACK_UPDATE = 'track_update_queue',
    TRACK_DELETE = 'track_delete_queue',
    TRACK_DL = 'track_dead_letter_queue',
    ALBUM_CREATE = 'album_create_queue',
    ALBUM_UPDATE = 'album_update_queue',
    ALBUM_DELETE = 'album_delete_queue',
    ALBUM_DL = 'album_dead_letter_queue',
    ARTIST_CREATE = 'artist_create_queue',
    ARTIST_UPDATE = 'artist_update_queue',
    ARTIST_DELETE = 'artist_delete_queue',
    ARTIST_DL = 'artist_dead_letter_queue',
    CAMPAIGN_UPDATE = 'campaign_update_queue',
    CAMPAIGN_DL = 'campaign_dead_letter_queue',
    ANNOUNCEMENT_UPDATE = 'announcement_update_queue'
}
