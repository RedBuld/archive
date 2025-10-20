import { Cover, Meta, Filters, Filterable } from "./general"

export interface Anime extends Filterable
{
    id: number
    // 
    name: string
    eng_name: string
    slug: string
    status: string
    // 
    mature: boolean
    // 
    cover: Cover
    covers: Cover[]
    // 
    ext: string
    filesize: number
    foldersize: number
    download_path: string
    mono: boolean
    meta: Meta
    timestamp: number
}

export interface AnimeSeason extends Filterable
{
    id: number
    // 
    number: number
    name: string
    eng_name: string
    slug: string
    status: string
    // 
    cover: Cover
    // 
    ext: string
    filesize: number
    foldersize: number
    download_path: string
    meta: Meta
    timestamp: number
    // 
    series: AnimeSeria[]
}

export interface AnimeSeria
{
    id: number
    // 
    number: number
    name: string
    eng_name: string
    // 
    ext: string
    filesize: number
    download_path: string
    meta: Meta
}

// export interface AnimeMeta {
//     status: string
//     width: string
//     height: string
//     format: string
//     alt_format: string
//     bit_depth: string
//     bit_rate: string
//     duration: string
//     overall_bit_rate: string
// }

export interface AnimeSingle extends Anime
{
    seasons: AnimeSeason[]
}

export interface AnimeSeasonSingle extends AnimeSeason
{
    anime: Anime
}

// 

export interface AnimeList
{
    animes: Anime[]
    filters: Filters
    timestamp: number
}

// 

export interface CachedAnimeList
{
    data: AnimeList
    timestamp: number
}

export interface CachedAnimeSingle
{
    data: AnimeSingle
    timestamp: number
}

export interface CachedAnimeSeasonSingle
{
    data: AnimeSeasonSingle
    timestamp: number
}