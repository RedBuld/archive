import { useState, useEffect, useRef, useContext, ReactElement } from 'react'
import { useSignalEffect } from '@preact/signals-react'
import { useSignalRef } from '@preact/signals-react/utils'
import { useParams  } from "react-router"
import parse from 'html-react-parser'
import { ReaderRanobe, ReaderRanobeChapter } from "@/types/ranobe"
import { ReaderContext } from '@/contexts/ReaderContext'
import { getRanobePageLink, getRanobeReaderPageLink } from '@/tools/navigation'
import { unpackRanobeChapter } from '@/tools/reader'
import { loadReaderRanobe, setRanobeLastRead } from '@/api/ranobe'
import Reader from '@/components/reader/Reader'
import RanobeReaderNavigationSidebar from '@/components/ranobe/reader/RanobeReaderNavigationSidebar'
import RanobeReaderSettingsSidebar from '@/components/ranobe/reader/RanobeReaderSettingsSidebar'
import RanobeReaderPages from '@/components/ranobe/reader/RanobeReaderPages'
import RanobeReaderFlow from '@/components/ranobe/reader/RanobeReaderFlow'
import './reader.css'

export default function RanobeReader()
{
    const readerContext = useContext(ReaderContext)

    // LOAD
    const controller = useRef<AbortController>(new AbortController())
    // LOAD

    // NAVIGATION DATA
    const { ranobe_slug, volume_number, chapter_number } = useParams()
    // NAVIGATION DATA
    
    // READER
    const readerRef = useSignalRef<HTMLDivElement>( null! )
    // 
    const [ ranobe, setRanobe ] = useState<ReaderRanobe|undefined>( null! )    
    const [ currentChapter, setCurrentChapter ] = useState<ReaderRanobeChapter>()
    const [ currentChapterContent, setCurrentChapterContent ] = useState<ReactElement[]>([])
    // READER

    async function loadRanobe()
    {
        let new_data = await loadReaderRanobe( ranobe_slug as string )
        if( new_data )
        {
            setRanobe( new_data )
        }
    }

    // 
    
    function filterCurrentChapter()
    {
        return ranobe?.chapters?.filter( (c) => c.volume_number == readerContext.currentVolumeNumber.value && c.number == readerContext.currentChapterNumber.value ).pop()
    }

    //

    function calculateNavigation()
    {
        if ( !ranobe || !currentChapter ) return null

        let current_chapter_index = ranobe.chapters.findIndex( c => c.volume_number == readerContext.currentVolumeNumber.value && c.number == readerContext.currentChapterNumber.value )

        let next_chapter_index = current_chapter_index+1
        let next_chapter = null

        let prev_chapter_index = current_chapter_index-1
        let prev_chapter = null

        if( next_chapter_index <= ranobe.chapters.length-1 )
        {
            next_chapter = ranobe.chapters[ next_chapter_index ]
        }

        if( prev_chapter_index >= 0 )
        {
            prev_chapter = ranobe.chapters[ prev_chapter_index ]
        }

        readerContext.setNavigationPrevLink( prev_chapter ? getRanobeReaderPageLink( ranobe.slug, prev_chapter.volume_number, prev_chapter.number ) : '' )
        readerContext.setNavigationNextLink( next_chapter ? getRanobeReaderPageLink( ranobe.slug, next_chapter.volume_number, next_chapter.number ) : '' )
    }

    // 

    function parseHTML( html: string )
    {
        let nodes = parse( html )
        setCurrentChapterContent( nodes as ReactElement[] )
    }

    // 

    useSignalEffect(
        () => {
            if( readerRef.current )
            {
                readerRef.current.style.setProperty( '--reader-font-size', `${readerContext.settings.value.ranobe.font_size}px` )
                readerRef.current.style.setProperty( '--reader-line-height', `${readerContext.settings.value.ranobe.line_height}` )
                readerRef.current.style.setProperty( '--reader-line-gap', `${readerContext.settings.value.ranobe.line_gap}px` )
                readerRef.current.style.setProperty( '--reader-text-align', `${readerContext.settings.value.ranobe.text_align}` )
                readerRef.current.style.setProperty( '--reader-text-indent', `${readerContext.settings.value.ranobe.text_indent == 'yes' ? '1.5' : '0' }em` )
            }
        }
    )

    useEffect(
        () => {
            readerContext.setCurrentProductLink( ranobe ? getRanobePageLink( ranobe.slug ) : '' )
            readerContext.setCurrentProductName( ranobe ? ranobe.name : '' )
            readerContext.setCurrentProductEngName( ranobe ? ranobe.eng_name : '' )
        },
        [ ranobe ]
    )
    
    useEffect(
        () => {
            setCurrentChapter( filterCurrentChapter() )
        },
        [ ranobe, readerContext.currentVolumeNumber.value, readerContext.currentChapterNumber.value ]
    )

    useEffect(
        () => {
            controller.current.abort('change page')
            controller.current = new AbortController()

            if( ranobe && currentChapter )
            {
                let current = `Том ${currentChapter.volume_number} Глава ${currentChapter.number}`
                readerContext.setCurrentPositionText( current )
                
                let title = `Читать ранобэ ${ranobe.name} — ${current} — Архив`
                document.title = title

                calculateNavigation()

                setRanobeLastRead( ranobe.id, readerContext.currentVolumeNumber.value, readerContext.currentChapterNumber.value )

                unpackRanobeChapter( currentChapter, `${ranobe.name} — ${current}`, readerContext.updateLoadingProgress, parseHTML, () => { console.log('failed') }, controller.current.signal )
            }
        },
        [ currentChapter ]
    )

    useEffect(
        () => {
            readerContext.setNowLoading( false )
        },
        [ currentChapterContent ]
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
            loadRanobe()
        },
        [ ranobe_slug ]
    )

    console.log('RanobeReader rerender')

    return (
        <Reader
            navigation={<RanobeReaderNavigationSidebar ranobe={ranobe} />}
            settings={<RanobeReaderSettingsSidebar/>}
        >
            { currentChapterContent.length ? (
                readerContext.settings.value.ranobe.mode == 'pages' ? 
                    <RanobeReaderPages
                        ref={readerRef}
                        content={currentChapterContent}
                    />
                    :
                    <RanobeReaderFlow
                        ref={readerRef}
                        content={currentChapterContent}
                    />
            ) : (<></>)}
        </Reader>
    )
}