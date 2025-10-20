import { useEffect, useRef, useContext, RefObject, MouseEvent, useState } from 'react'
import { Signal } from '@preact/signals-react'
import { UnpackedImage } from '@/types/general'
import { ReaderContext } from '@/contexts/ReaderContext'
import { useOnScreen } from '@/tools/general'

export default function MangaReaderFlow({
    images,
    currentVirtualPageNumber
}:{
    images: UnpackedImage[],
    currentVirtualPageNumber: Signal<number>
})
{
    const readerContext = useContext(ReaderContext)
    const handleKeyboardActionRef = useRef<Function>(null!)

    const [ renderDone, setRenderDone ] = useState<boolean>( false )

    const targetImage = useRef<HTMLDivElement>(null!)

    const left_zone_action = readerContext.settings.value.manga.direction == 'ltr' ? readerContext.moveToPrevChapter : readerContext.moveToNextChapter
    const right_zone_action = readerContext.settings.value.manga.direction == 'ltr' ? readerContext.moveToNextChapter : readerContext.moveToPrevChapter
    const middle_zone_action = readerContext.toggleHeaderFooter

    // 

    function saveCurrentVirtualPageNumber( v: number )
    {
        currentVirtualPageNumber.value = v
    }

    // 

    function handleKeyboardAction( event: KeyboardEvent )
    {
        if( readerContext.anySidebarVisible.value )
        {
            return
        }

        if( event.key == 'ArrowLeft' )
        {
            left_zone_action()
        }
        if( event.key == 'ArrowRight' )
        {
            right_zone_action()
        }
    }

    function handleClickAction( event: MouseEvent )
    {
        let container_width = event.currentTarget.clientWidth
        let container_click_position = event.pageX - (event.currentTarget as HTMLElement).offsetLeft
        let click_zone = Math.round( container_click_position / container_width * 100 )

        // if( 0 <= click_zone && click_zone <= 42 )
        // {
        //     return left_zone_action()
        // }
        if( 32 <= click_zone && click_zone <= 68 )
        {
            return middle_zone_action()
        }
        // if( 58 <= click_zone && click_zone <= 100 )
        // {
        //     return right_zone_action()
        // }
    }

    // 

    useEffect(
        () => {
            setRenderDone( false )
        },
        [ readerContext.settings.value.manga.fit ]
    )

    useEffect(
        () => {
            if( targetImage.current && !renderDone )
            {
                targetImage.current.scrollIntoView( true )
                setRenderDone( true )
            }
        },
        [ targetImage.current, renderDone ]
    )

    useEffect(
        () => {
            handleKeyboardActionRef.current = handleKeyboardAction
        },
        [ handleKeyboardAction ]
    )

    useEffect(
        () => {
            readerContext.setNowLoading( false )

            const eventListener = (event: KeyboardEvent) => handleKeyboardActionRef.current( event )
            window.addEventListener( 'keydown', eventListener )
            return () => {
                window.removeEventListener( 'keydown', eventListener )
            }
        },
        []
    )

    let gap = ''

    switch (readerContext.settings.value.manga.gap) {
        case '1':
            gap = 'gap-y-2'
            break;
        case '2':
            gap = 'gap-y-4'
            break;
        case '3':
            gap = 'gap-y-6'
            break;
        case '4':
            gap = 'gap-y-8'
            break;
        case '5':
            gap = 'gap-y-10'
            break;
        case '6':
            gap = 'gap-y-12'
            break;
    }

    return (
        <div
            tabIndex={0}
            className="flex flex-col items-center w-full"
        >
            <div
                onClick={ handleClickAction }
                className={`flex flex-col justify-center items-center w-full max-w-screen-2xl relative ${gap}`}
            >
                { images.length ? (
                    images.map( (element,i) => (
                        <MangaReaderFlowImage
                            key={element.name}
                            image={element}
                            imageIndex={i+1}
                            targetImage={targetImage}
                            fitMode={ readerContext.settings.value.manga.fit }
                            scrollToIndex={ renderDone ? null : currentVirtualPageNumber.value }
                            saveCurrentVirtualPage={ saveCurrentVirtualPageNumber }
                        />
                        )
                    )
                ) : (<></>) }
            </div>
        </div>
    )
}

function MangaReaderFlowImage({
    image,
    imageIndex,
    targetImage,
    fitMode,
    scrollToIndex,
    saveCurrentVirtualPage
}:{
    image: UnpackedImage,
    imageIndex: number,
    targetImage: RefObject<HTMLDivElement>,
    fitMode: string,
    scrollToIndex: number|null,
    saveCurrentVirtualPage: Function
})
{
    const visibleRef = useRef<HTMLDivElement>(null)
    const visible = useOnScreen(visibleRef)

    useEffect(
        () => {
            visible && saveCurrentVirtualPage( imageIndex )
        },
        [ visible ]
    )

    useEffect(
        () => {
            if( visibleRef.current )
            {
                if( imageIndex == scrollToIndex )
                {
                    targetImage.current = visibleRef.current
                }
            }
        },
        [ visibleRef.current ]
    )

    return (
        <div
            ref={visibleRef}
            className="flex flex-col justify-center max-w-full"
            data-page={imageIndex}
            style={{"aspectRatio":`${image.width}/${image.height}`}}
        >
            <img className={`flex mx-auto ${fitMode=='width' ? 'max-w-full' : 'max-h-screen'}`} key={image.name} title={image.name} src={image.url} />
        </div>
        )
}