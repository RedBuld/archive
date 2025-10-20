import { Cover, Meta, Filterable, UnpackedImage } from "@/types/general"
import { ReaderChapter, ReaderVolume, ReaderSettings } from "@/types/reader"

export interface Ranobe extends Filterable
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

export interface RanobeVolume
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
    chapters: RanobeChapter[]
}

export interface RanobeChapter
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

export interface RanobeChapterImages
{
    [index: string]: UnpackedImage
}


export interface RanobeSingle extends Ranobe
{
    volumes: RanobeVolume[]
}

// 

export interface ReaderRanobe
{
    id: number
    name: string
    eng_name: string
    slug: string
    // 
    timestamp: number
    chapters: ReaderRanobeChapter[]
}

export interface ReaderRanobeVolume extends ReaderVolume
{
    chapters: ReaderRanobeChapter[]
}

export interface ReaderRanobeChapter extends ReaderChapter
{
    filesize: number
    download_path: string
}

export interface ReaderRanobeSettings extends ReaderSettings {}