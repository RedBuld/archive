import { useEffect, useContext, ReactElement } from 'react'
import { useSignal, useSignalEffect } from '@preact/signals-react'
import { useSignalRef } from '@preact/signals-react/utils'
import { ReaderRanobe, ReaderRanobeChapter } from "@/types/ranobe"
import { ReaderContext } from '@/contexts/ReaderContext'
import { SlateToReact } from '@/tools/reader'
import Reader from '@/components/reader/Reader'
import RanobeReaderSettingsSidebar from '@/components/ranobe/reader/RanobeReaderSettingsSidebar'
import RanobeReaderPages from '@/components/ranobe/reader/RanobeReaderPages'
import RanobeReaderFlow from '@/components/ranobe/reader/RanobeReaderFlow'
import '../../components/ranobe/reader/reader.css'

// unpackRanobeChapter( currentChapter, `${ranobe.name} — ${current}`, readerContext.updateLoadingProgress, parseHTML, () => { console.log('failed') }, controller.current.signal )

export default function DemoPreviewPage()
{
    const readerContext = useContext( ReaderContext )
    
    // READER
    const readerRef = useSignalRef<HTMLDivElement>( null! )
    // 
    const ranobe = useSignal<ReaderRanobe|null>({
        id: 0,
        name: 'Превью',
        eng_name: 'Preview',
        slug: '',
        timestamp: 0,
        navigation: []
    })
    const currentChapterData = useSignal<ReaderRanobeChapter>({
        id: 0,
        number: 0,
        volume_number: 0,
        name: 'ДЕМО Превью',
        eng_name: 'DEMO preview',
        content: JSON.parse( localStorage.getItem( 'editor_cache' ) ?? '[]' ),
        timestamp: 0
    })
    const currentChapterTitle = useSignal<string>('')
    const currentChapterNodes = useSignal<ReactElement[]>([])
    // READER

    function computeNodes()
    {
        let nodes = currentChapterData.value?.content.map( (el,i) => { return SlateToReact( el, 0, `${i}` ) } ).filter( v => v )
        currentChapterNodes.value = nodes as ReactElement[]
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

    useSignalEffect(
        () => {
            readerContext.setCurrentProductLink( '' )
            readerContext.setCurrentProductName( ranobe.value ? ranobe.value.name : '' )
            readerContext.setCurrentProductEngName( ranobe.value ? ranobe.value.eng_name : '' )
        }
    )

    // 

    useEffect(
        () => {
            if( ranobe.value && currentChapterData.value )
            {
                readerContext.setNowLoading( false )
                readerContext.setFirstLoadingDone( true )

                let chapterTitle = ''
                let current = `Том ${currentChapterData.value.volume_number} Глава ${currentChapterData.value.number}`
                if( currentChapterData.value.name )
                {
                    chapterTitle = `${current} — ${currentChapterData.value.name}`
                }
                readerContext.setCurrentPositionText( current )
                
                let title = `Читать ранобэ ${ranobe.value.name} — ${current} — Архив`
                document.title = title

                currentChapterTitle.value = chapterTitle
                computeNodes()
            }
        },
        [ currentChapterData.value ]
    )

    useEffect(
        () => {
            window.addEventListener('storage', (ev: StorageEvent) => {
                if( ev.key == 'editor_cache' )
                {
                    currentChapterData.value = { ...currentChapterData.value, 'content': JSON.parse( ev.newValue??'[]' ) }
                }
            })
        },
        []
    )

    console.log('RanobeReader rerender')

    return (
        <Reader
            navigation={<></>}
            settings={<RanobeReaderSettingsSidebar/>}
        >
            { currentChapterData ? (
                readerContext.settings.value.ranobe.mode == 'pages' ? 
                    <RanobeReaderPages
                        ref={readerRef}
                        title={currentChapterTitle.value}
                        content={currentChapterNodes.value}
                    />
                    :
                    <RanobeReaderFlow
                        ref={readerRef}
                        title={currentChapterTitle.value}
                        content={currentChapterNodes.value}
                    />
            ) : (<></>)}
        </Reader>
    )
}