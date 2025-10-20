export interface loadingBreaker
{
    [index: string]: boolean
}

export interface ShortData
{
    id: number
    name: string
}

export interface Meta
{
    [index: string]: string
}

export interface Cover
{
    full: string
    mini: string
}

export interface SearchResult
{
    name: string
    eng_name: string
    slug: string
    type: string
    cover: string
}

export interface SearchResults
{
    anime: SearchResult[]
    manga: SearchResult[]
    // books: SearchResult[]
    ranobe: SearchResult[]
    found: number
}

export const nullSearchResults: SearchResults = {
    anime: [],
    manga: [],
    ranobe: [],
    found: 0
}

export interface Filters
{
    [index: string]: any[]
}

export interface Filterable
{
    voices?: ShortData[]
    studios?: ShortData[]
    genres?: ShortData[]
    authors?: ShortData[]
}

export interface Notification
{
    id: number
    type: string
    message: string
    datetime_date: string
    datetime_time: string
    cover: string
    routine: string[]
    objects: {
        [index: string]: NotificationElement
    }
}

export interface NotificationElement
{
    name: string
    eng_name: string
    slug: string
    type: string
}

export interface Notifications
{
    data: Notification[]
    timestamp: number
}

export interface CachedLastNotifications
{
    data: Notifications
    timestamp: number
}

export interface StorageStats
{
    used: number
    free: number
    total: number
}

export const StorageStatsInitial: StorageStats = {
    used: 0,
    total: 1,
    free: 1
}

export interface CachedFile {
    url: string,
    name: string,
    size: string,
    cache_name: string
}

export const FilterToLabel: { [index: string]: string } = {
    "studios": "Студия",
    "genres": "Жанр",
    "authors": "Автор",
    "voices": "Озвучка",
}

// 

export interface UnpackedImage extends UnpackedImageDimensions
{
    name: string
    url: string
}

export interface UnpackedImageDimensions
{
    width: number
    height: number
}