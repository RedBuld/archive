import { Cover, Meta, Filterable } from "@/types/general"
import { ReaderChapter, ReaderVolume, ReaderSettings } from "@/types/reader"

export interface Manga extends Filterable
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
    meta: Meta
    timestamp: number
}

export interface MangaVolume
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
    // 
    chapters: MangaChapter[]
}

export interface MangaChapter
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
}


export interface MangaSingle extends Manga
{
    volumes: MangaVolume[]
}

// 

export interface CachedMangaSingle
{
    data: MangaSingle
    timestamp: number
}

export interface CachedMangaList
{
    data: Manga[]
    timestamp: number
}

// 

export interface ReaderManga
{
    id: number
    name: string
    eng_name: string
    slug: string
    // 
    timestamp: number
    chapters: ReaderMangaChapter[]
}

export interface ReaderMangaVolume extends ReaderVolume
{
    chapters: ReaderMangaChapter[]
}

export interface ReaderMangaChapter extends ReaderChapter
{
    filesize: number
    download_path: string
}

export interface ReaderMangaSettings extends ReaderSettings {}