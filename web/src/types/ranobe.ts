import { Cover, Meta, Filterable, UnpackedImage } from "@/types/general"
// import { ReaderChapter, ReaderVolume, ReaderSettings } from "@/types/reader"

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
    timestamp: number
    // 
    navigation: ReaderRanobeNavigationElement[]
}

export interface ReaderRanobeNavigationElement
{
    id: number
    number: number
    volume_number: number
    name: string
    eng_name: string
}


export interface ReaderRanobeChapter
{
    id: number
    number: number
    volume_number: number
    name: string
    eng_name: string
    content: ReaderRanobeChapterElement[]
    // 
    timestamp: number
}

const NodeTypes = [
    "paragraph",
    "heading-one",
    "heading-two",
    "heading-three",
    "heading-four",
    "heading-five",
    "heading-six",
    "block-quote",
    "bulleted-list",
    "numbered-list",
    "list-item",
    "table",
    "table-row",
    "table-cell",
    "link",
    "image",
    "code-block"
]

export interface ReaderRanobeChapterElement extends Object
{
    type: (typeof NodeTypes)[number]
    children: ReaderRanobeChapterElement[]
    bold?: boolean
    align?: string
    italic?: boolean
    underline?: boolean
    strikethrough?: boolean
}

export interface ReaderRanobeChapterText extends Object
{
    text: string
    bold?: boolean
    align?: string
    italic?: boolean
    underline?: boolean
    strikethrough?: boolean
}