import { RefObject, useContext } from "react"
import { NavLink } from "react-router"
import { ReaderMangaVolume, ReaderMangaChapter, ReaderManga } from "@/types/manga"
import { ReaderContext, ReaderNavigationContext } from "@/contexts/ReaderContext"
import { getMangaReaderPageLink } from '@/tools/navigation'

export default function MangaReaderNavigationSidebar({
    manga
}:{
    manga?: ReaderMangaVolume
})
{
    const readerContext = useContext(ReaderContext)
    const readerNavigationContext = useContext(ReaderNavigationContext)

    return (
        <div className="flex flex-col">
        { manga?.chapters && manga.chapters.map( (chapter) => {
            return <MangaReaderNavigationSidebarElement
                key={chapter.number}
                manga={manga}
                chapter={chapter}
                currentVolume={readerContext.currentVolumeNumber.value}
                currentChapter={readerContext.currentChapterNumber.value}
                activeLinkRef={readerNavigationContext.activeLinkRef}
            />
        }) }
        </div>
    )
}

function MangaReaderNavigationSidebarElement({
    manga,
    chapter,
    currentVolume,
    currentChapter,
    activeLinkRef
}:{
    manga: ReaderManga,
    chapter: ReaderMangaChapter,
    currentVolume: number,
    currentChapter: number,
    activeLinkRef: RefObject<HTMLAnchorElement|null>
}) {
    
    const active = (currentVolume == chapter.volume_number && currentChapter == chapter.number)
    const link = getMangaReaderPageLink( manga.slug, chapter.volume_number, chapter.number )

    return (
        <NavLink
            to={ link }
            ref={ active ? activeLinkRef : null }
            key={`sm_${chapter.volume_number}_${chapter.number}`}
            className={`inline-flex flex-row gap-2 px-6 py-3 text-base font-light ${ active ? 'bg-sky-500/40 pointer-events-none': 'hover:bg-white/10 cursor-pointer'}`}
        >
            <span className={`font-medium ${ active ? 'text-white/80' : 'text-white/60' }`}>Том {chapter.volume_number}</span>
            <span className={`${ active ? 'text-white' : 'text-white/80' }`}>Глава {chapter.number}</span>
        </NavLink>
    )
}