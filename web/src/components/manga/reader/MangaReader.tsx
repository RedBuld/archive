import { useState, useEffect, useRef, useContext } from 'react'
import { useSignal, useSignalEffect } from '@preact/signals-react'
import { useParams  } from "react-router"
import { UnpackedImage } from "@/types/general"
import { ReaderManga, ReaderMangaChapter } from "@/types/manga"
import { ReaderContext } from '@/contexts/ReaderContext'
import { getMangaPageLink, getMangaReaderPageLink } from '@/tools/navigation'
import { unpackMangaChapter } from '@/tools/reader'
import { loadReaderManga, setMangaLastRead } from '@/api/manga'
import Reader from '@/components/reader/Reader'
import MangaReaderNavigationSidebar from '@/components/manga/reader/MangaReaderNavigationSidebar'
import MangaReaderSettingsSidebar from '@/components/manga/reader/MangaReaderSettingsSidebar'
import MangaReaderPages from '@/components/manga/reader/MangaReaderPages'
import MangaReaderFlow from '@/components/manga/reader/MangaReaderFlow'

export default function MangaReader()
{
    const readerContext = useContext( ReaderContext )

    // LOAD
    const controller = useRef<AbortController>(new AbortController())
    // LOAD

    // NAVIGATION DATA
    const hash = window.location.hash
    const { manga_slug, volume_number, chapter_number } = useParams()
    // NAVIGATION DATA
    
    // READER
    const [ manga, setManga ] = useState<ReaderManga|undefined>( null! )    
    const [ currentChapter, setCurrentChapter ] = useState<ReaderMangaChapter>()
    const [ currentChapterImages, setCurrentChapterImages ] = useState<UnpackedImage[]>([])
    const currentVirtualPageNumber = useSignal<number>( hash ? parseInt( hash.slice(1)??'1') : 1 )
    // READER

    async function loadManga()
    {
        let new_data = await loadReaderManga( manga_slug as string )
        if( new_data )
        {
            setManga( new_data )
        }
    }

    // 
    
    function filterCurrentChapter()
    {
        return manga?.chapters?.filter( (c) => c.volume_number == readerContext.currentVolumeNumber.value && c.number == readerContext.currentChapterNumber.value ).pop()
    }

    //

    function calculateNavigation()
    {
        if ( !manga || !currentChapter ) return null

        let current_chapter_index = manga.chapters.findIndex( c => c.volume_number == readerContext.currentVolumeNumber.value && c.number == readerContext.currentChapterNumber.value )

        let next_chapter_index = current_chapter_index+1
        let next_chapter = null

        let prev_chapter_index = current_chapter_index-1
        let prev_chapter = null

        if( next_chapter_index <= manga.chapters.length-1 )
        {
            next_chapter = manga.chapters[ next_chapter_index ]
        }

        if( prev_chapter_index >= 0 )
        {
            prev_chapter = manga.chapters[ prev_chapter_index ]
        }

        readerContext.setNavigationPrevLink( prev_chapter ? getMangaReaderPageLink( manga.slug, prev_chapter.volume_number, prev_chapter.number ) : '' )
        readerContext.setNavigationNextLink( next_chapter ? getMangaReaderPageLink( manga.slug, next_chapter.volume_number, next_chapter.number ) : '' )
    }

    // 

    function updateImagesList( images: UnpackedImage[] )
    {
        currentChapterImages.map(
            ( image ) => {
                window.URL.revokeObjectURL( image.url )
            }
        )
        setCurrentChapterImages( images )
        readerContext.setNowLoading( false )
    }

    // 

    useSignalEffect(
        () => {
            history.replaceState(null, '', `#${currentVirtualPageNumber.value}`)
            manga && setMangaLastRead( manga.id, readerContext.currentVolumeNumber.value, readerContext.currentChapterNumber.value, currentVirtualPageNumber.value )
        }
    )

    useEffect(
        () => {
            readerContext.setCurrentProductLink( manga ? getMangaPageLink( manga.slug ) : '' )
            readerContext.setCurrentProductName( manga ? manga.name : '' )
            readerContext.setCurrentProductEngName( manga ? manga.eng_name : '' )
        },
        [ manga ]
    )
    
    useEffect(
        () => {
            setCurrentChapter( filterCurrentChapter() )
        },
        [ manga, readerContext.currentVolumeNumber.value, readerContext.currentChapterNumber.value ]
    )

    useEffect(
        () => {
            controller.current.abort('change page')
            controller.current = new AbortController()

            if( manga && currentChapter )
            {
                let current = `Том ${currentChapter.volume_number} Глава ${currentChapter.number}`
                readerContext.setCurrentPositionText( current )
                
                let title = `Читать мангу ${manga.name} — ${current} — Архив`
                document.title = title

                calculateNavigation()

                readerContext.setFirstLoadingDone( true )

                // setMangaLastRead( manga.id, readerContext.currentVolumeNumber.value, readerContext.currentChapterNumber.value, currentImageIndex )

                unpackMangaChapter( currentChapter, `${manga.name} — ${current}`, readerContext.updateLoadingProgress, updateImagesList, () => { console.log('failed') }, controller.current.signal )
            }
        },
        [ currentChapter ]
    )

    useEffect(
        () => {
            if( volume_number && chapter_number )
            {
                readerContext.setCurrentVolumeNumber( parseFloat( volume_number ) )
                readerContext.setCurrentChapterNumber( parseFloat( chapter_number ) )
            }
        },
        [ volume_number, chapter_number ]
    )

    useEffect(
        () => {
            loadManga()
        },
        [ manga_slug ]
    )

    return (
        <Reader
            navigation={<MangaReaderNavigationSidebar manga={manga} />}
            settings={<MangaReaderSettingsSidebar/>}
        >
            { currentChapterImages.length ? (
                readerContext.settings.value.manga.mode == 'pages' ? 
                    <MangaReaderPages
                        images={currentChapterImages}
                        currentVirtualPageNumber={currentVirtualPageNumber}
                    />
                    :
                    <MangaReaderFlow
                        images={currentChapterImages}
                        currentVirtualPageNumber={currentVirtualPageNumber}
                    />
            ) : (<></>)}
        </Reader>
    )
}