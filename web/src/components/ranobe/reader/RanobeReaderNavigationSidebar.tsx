import { RefObject, useContext } from "react"
import { NavLink } from "react-router"
import { ReaderRanobeVolume, ReaderRanobeChapter, ReaderRanobe } from "@/types/ranobe"
import { ReaderContext, ReaderNavigationContext } from "@/contexts/ReaderContext"
import { getRanobeReaderPageLink } from '@/tools/navigation'

export default function RanobeReaderNavigationSidebar({
    ranobe
}:{
    ranobe?: ReaderRanobeVolume
})
{
    const readerContext = useContext( ReaderContext )

    const readerNavigationContext = useContext( ReaderNavigationContext )

    return (
        <div className="flex flex-col">
        { ranobe?.chapters && ranobe.chapters.map( (chapter) => {
            return <RanobeReaderNavigationSidebarElement
                key={chapter.number}
                ranobe={ranobe}
                chapter={chapter}
                currentVolume={readerContext.currentVolumeNumber.value}
                currentChapter={readerContext.currentChapterNumber.value}
                activeLinkRef={readerNavigationContext.activeLinkRef}
            />
        }) }
        </div>
    )
}

function RanobeReaderNavigationSidebarElement({
    ranobe,
    chapter,
    currentVolume,
    currentChapter,
    activeLinkRef
}:{
    ranobe: ReaderRanobe,
    chapter: ReaderRanobeChapter,
    currentVolume: number,
    currentChapter: number,
    activeLinkRef: RefObject<HTMLAnchorElement|null>
}) {
    
    const active = ( currentVolume == chapter.volume_number && currentChapter == chapter.number )
    const link = getRanobeReaderPageLink( ranobe.slug, chapter.volume_number, chapter.number )

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