import { Signal } from "@preact/signals"
import { RefObject } from "react"

export const MANGA_CACHE = "manga_chapters"
export const RANOBE_CACHE = "ranobe_chapters"

export interface ReaderContextType
{
    header: RefObject<HTMLDivElement|null>
    footer: RefObject<HTMLDivElement|null>
    progress: RefObject<SVGSVGElement|null>
    // 
    updateLoadingProgress: ( loaded: number, total: number ) => void
    toTop: () => void
    // 
    headerVisible: Signal<boolean>, showHeader: () => void, hideHeader: () => void
    footerVisible: Signal<boolean>, showFooter: () => void, hideFooter: () => void
    manuallyToggledHF: Signal<boolean>, setManuallyToggledHF: ( v: boolean ) => void
    // 
    navigationSidebarVisible: Signal<boolean>, showNavigationSidebar: () => void, hideNavigationSidebar: () => void
    settingsSidebarVisible: Signal<boolean>, showSettingsSidebar: () => void, hideSettingsSidebar: () => void
    anySidebarVisible: Signal<boolean>
    // 
    toggleHeaderFooter: () => void
    showHeaderFooter: () => void
    hideHeaderFooter: () => void
    // 
    nowLoading: Signal<boolean>, setNowLoading: ( v: boolean ) => void
    firstLoadingDone: Signal<boolean>, setFirstLoadingDone: ( v: boolean ) => void
    // 
    settings: Signal<ReaderSettings>, setSettings: ( v: any ) => void
    // 
    currentProductLink: Signal<string>, setCurrentProductLink: ( v: string ) => void
    currentProductName: Signal<string>, setCurrentProductName: ( v: string ) => void
    currentProductEngName: Signal<string>, setCurrentProductEngName: ( v: string ) => void
    // 
    navigationPrevLink: Signal<string>, setNavigationPrevLink: ( v: string ) => void
    navigationNextLink: Signal<string>, setNavigationNextLink: ( v: string ) => void
    // 
    currentVolumeNumber: Signal<number>, setCurrentVolumeNumber: ( v: number ) => void
    currentChapterNumber: Signal<number>, setCurrentChapterNumber: ( v: number ) => void
    currentPositionText: Signal<string>, setCurrentPositionText: ( v: string ) => void
    // 
    isBackward: RefObject<boolean|null>, setIsBackward: ( v: boolean ) => void
    moveToNextChapter: () => void
    moveToPrevChapter: () => void
    moveToChapter: ( link: string ) => void
}

export interface ReaderNavigationContextType
{
    activeLinkRef: RefObject<HTMLAnchorElement|null>
    scrollTop: number, setScrollTop: Function
}

export interface ReaderSettings
{
    manga: {
        mode: string
        direction: string
        gap: string
        fit: string
        [index: string]: string
    }
    ranobe: {
        mode: string
        direction: string
        font_size: string
        line_height: string
        line_gap: string
        text_align: string
        text_indent: string
        show_images: string
        columns: string
        [index: string]: string
    }
}

export const DefaultReaderSettings: ReaderSettings = {
    'manga': {
        'mode': 'pages',
        'direction': 'ltr',
        'gap': '1',
        'fit': 'height',
    },
    'ranobe': {
        'mode': 'flow',
        'direction': 'ltr',
        'font_size': '16',
        'line_height': '1.4',
        'line_gap': '10',
        'text_align': 'justify',
        'text_indent': 'no',
        'show_images': 'yes',
        'columns': '2',
    }
}

// 

export interface ReaderVolume {
    id: number
    name: string
    eng_name: string
    slug: string
    timestamp: number
    chapters: ReaderChapter[]
}

export interface ReaderChapter
{
    number: number
    volume_number: number
}

export interface CachedReader
{
    data: ReaderVolume
    timestamp: number
}