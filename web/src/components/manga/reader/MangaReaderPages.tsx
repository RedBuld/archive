import { useEffect, useState, useContext, MouseEvent, TouchEvent, useRef, RefObject } from 'react'
import { Signal, useSignal, useSignalEffect } from "@preact/signals-react"
import { UnpackedImage } from '@/types/general'
import { ReaderContext } from '@/contexts/ReaderContext'

export default function MangaReaderPages({
    images,
    currentVirtualPageNumber
}:{
    images: UnpackedImage[],
    currentVirtualPageNumber: Signal<number>
})
{
    const readerContext = useContext( ReaderContext )
    const handleKeyboardActionRef = useRef<Function>(null!)

    const swipe_treshold = 100

    const [ renderDone, setRenderDone ] = useState<boolean>( false )
    const targetImage = useRef<HTMLDivElement>(null!)

    const [ minVirtualPageIndex ] = useState<number>( 1 )
    const [ maxVirtualPageIndex, setMaxVirtualPageIndex ] = useState<number>( images.length )
    const currentVirtualPageIndex = useSignal<number>( 1 )

    const touchStartPosition = useRef<number|null>( null )
    const touchEndPosition = useRef<number|null>( null )

    const left_zone_action = readerContext.settings.value.manga.direction == 'ltr' ? prevVirtualPage : nextVirtualPage
    const right_zone_action = readerContext.settings.value.manga.direction == 'ltr' ? nextVirtualPage : prevVirtualPage
    const middle_zone_action = readerContext.toggleHeaderFooter

    // 

    function saveCurrentVirtualPageNumber( v: number )
    {
        currentVirtualPageNumber.value = v
    }

    // 

    function prevVirtualPage()
    {
        if( readerContext.nowLoading.value )
        {
            return
        }

        let prev_page = currentVirtualPageIndex.value-1
        if( prev_page < minVirtualPageIndex )
        {
            readerContext.setIsBackward( true )
            return readerContext.moveToPrevChapter()
        }
        currentVirtualPageIndex.value = prev_page
        readerContext.toTop()
    }

    function nextVirtualPage()
    {
        if( readerContext.nowLoading.value )
        {
            return
        }

        let next_page = currentVirtualPageIndex.value+1
        if( next_page > maxVirtualPageIndex )
        {
            return readerContext.moveToNextChapter()
        }
        currentVirtualPageIndex.value = next_page
        readerContext.toTop()
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
            return left_zone_action()
        }

        if( event.key == 'ArrowRight' )
        {
            return right_zone_action()
        }
    }

    function handleClickAction( event: MouseEvent )
    {
        let containerWidth = event.currentTarget.clientWidth;
        let container_click_position = event.pageX - (event.currentTarget as HTMLElement).offsetLeft;
        let click_zone = Math.round( container_click_position / containerWidth * 100 )

        if( 0 <= click_zone && click_zone <= 42 )
        {
            return left_zone_action()
        }
        if( 42 <= click_zone && click_zone <= 58 )
        {
            return middle_zone_action()
        }
        if( 58 <= click_zone && click_zone <= 100 )
        {
            return right_zone_action()
        }
    }

    function handleSwipeAction()
    {
        if( readerContext.anySidebarVisible.value )
        {
            return
        }

        if( !touchStartPosition.current || !touchEndPosition.current ) return

        const distance = touchStartPosition.current - touchEndPosition.current
        const go_next = distance > swipe_treshold
        const go_prev = distance < -swipe_treshold

        if( go_prev )
        {
            return left_zone_action()
        }

        if( go_next )
        {
            return right_zone_action()
        }
    }

    useEffect(
        () => {
            let max_virtual_pages = images.length
            if( max_virtual_pages > 0 )
            {
                if( readerContext.isBackward.current )
                {
                    readerContext.setIsBackward( false )
                    currentVirtualPageIndex.value = max_virtual_pages
                }
                else
                {
                    readerContext.setIsBackward( false )
                    currentVirtualPageIndex.value = renderDone ? 1 : currentVirtualPageNumber.value
                }
            }
            setMaxVirtualPageIndex( max_virtual_pages )
            readerContext.setNowLoading( false )
        },
        [ images ]
    )

    // 

    function handleTouchStart( event: TouchEvent )
    {
        touchStartPosition.current = event.targetTouches[0].clientX
        touchEndPosition.current = null
    }

    function handleTouchEnd( event: TouchEvent )
    {
        if( !touchStartPosition.current ) return
        touchEndPosition.current = event.changedTouches[0].clientX
        handleSwipeAction()
    }

    function handleTouchCancel()
    {
        touchStartPosition.current = null
        touchEndPosition.current = null
    }

    // 

    useEffect(
        () => {
            if( targetImage.current )
            {
                targetImage.current.scrollIntoView( true )
            }
        },
        [ targetImage.current ]
    )

    useSignalEffect(
        () => {
            saveCurrentVirtualPageNumber( currentVirtualPageIndex.value )
        }
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
            setRenderDone( true )
            // 
            currentVirtualPageIndex.value = currentVirtualPageNumber.value

            const eventListener = (event: KeyboardEvent) => handleKeyboardActionRef.current( event )
            window.addEventListener( 'keydown', eventListener )
            return () => {
                window.removeEventListener( 'keydown', eventListener )
            }
        },
        []
    )

    return (
        <div
            onTouchStart={ handleTouchStart }
            onTouchEnd={ handleTouchEnd }
            onTouchCancel={ handleTouchCancel }
            tabIndex={0}
            className="relative flex flex-grow flex-shrink-0 flex-col justify-center items-center w-full min-h-screen sm:min-h-auto mb-12"
        >
            <div
                onClick={ handleClickAction }
                className="flex flex-grow flex-col justify-center items-center w-full max-w-screen-2xl min-h-[var(--min-h-compensated)] sm:min-h-screen"
            >
                { images.length > 0 ? (
                    images.map( (element,i) => (
                        <MangaReaderPagesImage
                            key={element.name}
                            image={element}
                            imageIndex={i+1}
                            targetImage={targetImage}
                            fitMode={ readerContext.settings.value.manga.fit }
                            scrollToIndex={ renderDone ? null : currentVirtualPageNumber.value }
                            currentVirtualPageIndex={ currentVirtualPageIndex }
                        />
                    ) )
                ) : (<></>)}
            </div>
            <div className="flex absolute p-2 left-auto right-auto text-xs text-white -bottom-11">{currentVirtualPageIndex} / {maxVirtualPageIndex}</div>
        </div>
    )
}

function MangaReaderPagesImage({
    image,
    imageIndex,
    targetImage,
    fitMode,
    scrollToIndex,
    currentVirtualPageIndex,
}:{
    image: UnpackedImage,
    imageIndex: number,
    targetImage: RefObject<HTMLDivElement>,
    fitMode: string,
    scrollToIndex: number|null,
    currentVirtualPageIndex: Signal<number>,
})
{
    const visibleRef = useRef<HTMLDivElement>(null)
    const visible = currentVirtualPageIndex.value == imageIndex

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
            className={`${visible ? 'flex' : 'hidden'} flex-col justify-center max-w-full`}
            data-page={imageIndex}
            style={{"aspectRatio":`${image.width}/${image.height}`}}
        >
            <img className={`flex mx-auto ${fitMode=='width' ? 'max-w-full' : 'max-h-screen'}`} key={image.name} title={image.name} src={image.url} />
        </div>
        )
}