import { useEffect, useState, useContext, RefObject, ReactElement, MouseEvent, TouchEvent, useRef } from 'react'
import { ReaderContext } from '@/contexts/ReaderContext'
import { useSignal, useSignalEffect } from '@preact/signals-react'

export default function RanobeReaderPages({
    content,
    ref
}:{
    content: ReactElement[],
    ref: RefObject<HTMLDivElement>
})
{
    const readerContext = useContext( ReaderContext )
    const handleKeyboardActionRef = useRef<Function>(null!)
    const calculatePagesRef = useRef<Function>(null!)

    const vPagesRef = useRef<HTMLDivElement>(null!)

    const swipe_treshold = 100
    const min_column_gap = 10
    const base_column_gap = readerContext.settings.value.ranobe.columns == '2' ? 100 : min_column_gap
    const min_page_width_for_columns = 1000

    const [ minVirtualPageIndex ] = useState<number>( 1 )
    const [ maxVirtualPageIndex, setMaxVirtualPageIndex ] = useState<number>( 1 )
    const currentVirtualPageIndex = useSignal<number>( 1 )
    // 
    const readerWidth = useSignal<number>( 1 )
    const columnGap = useSignal<number>( ( readerContext.settings.value.ranobe.columns == '2' && window.innerWidth > min_page_width_for_columns ) ? base_column_gap : min_column_gap )
    const columnWidth = useSignal<number>( 1 )

    const touchStartPosition = useRef<number|null>( null )
    const touchEndPosition = useRef<number|null>( null )

    const left_zone_action = readerContext.settings.value.ranobe.direction == 'ltr' ? prevVirtualPage : nextVirtualPage
    const right_zone_action = readerContext.settings.value.ranobe.direction == 'ltr' ? nextVirtualPage : prevVirtualPage
    const middle_zone_action = readerContext.toggleHeaderFooter

    function calculatePages()
    {
        if( ref.current )
        {
            let _columns = ( window.innerWidth > min_page_width_for_columns ) ? parseInt( readerContext.settings.value.ranobe.columns ) : 1
            let _readerWidth = ref.current.clientWidth
            let _columnGap = ( readerContext.settings.value.ranobe.columns == '2' && window.innerWidth > min_page_width_for_columns ) ? base_column_gap : min_column_gap
            let _columnWidth = ( _readerWidth - _columnGap ) / _columns
            let _maxVirtualPageIndex = Math.round( ref.current.scrollWidth / _readerWidth )

            readerWidth.value = _readerWidth
            columnGap.value = _columnGap
            columnWidth.value = _columnWidth
            setMaxVirtualPageIndex( _maxVirtualPageIndex )
        }
    }

    function prevVirtualPage()
    {
        if( readerContext.nowLoading.value )
        {
            return
        }

        let prev_page = currentVirtualPageIndex.value-1
        if( prev_page < minVirtualPageIndex )
        {
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

    useSignalEffect(
        () => {
            if( vPagesRef.current )
            {
                vPagesRef.current.style.setProperty( 'column-gap', columnGap.value+'px' )
                vPagesRef.current.style.setProperty( 'column-width', columnWidth.value+'px' )
                vPagesRef.current.style.setProperty( 'left', ( -1 * ( currentVirtualPageIndex.value - 1 ) * ( readerWidth.value + columnGap.value ) )+'px' )
            }
        }
    )

    useEffect(
        () => {
            calculatePages()
        },
        [ readerContext.nowLoading.value ]
    )

    useEffect(
        () => {
            currentVirtualPageIndex.value = minVirtualPageIndex
            calculatePages()
        },
        [ content ]
    )

    useEffect(
        () => {
            calculatePages()
        },
        [ content, readerContext.settings.value.ranobe ]
    )

    useEffect(
        () => {
            handleKeyboardActionRef.current = handleKeyboardAction
        },
        [ handleKeyboardAction ]
    )

    useEffect(
        () => {
            calculatePagesRef.current = calculatePages
        },
        [ calculatePages ]
    )

    useEffect(
        () => {
            readerContext.setFirstLoadingDone( true )

            const kbEventListener = (event: KeyboardEvent) => handleKeyboardActionRef.current( event )
            const cpEventListener = () => calculatePagesRef.current()

            window.addEventListener( 'keydown', kbEventListener )
            window.addEventListener( 'resize', cpEventListener )
            return () => {
                window.removeEventListener( 'keydown', kbEventListener )
                window.removeEventListener( 'resize', cpEventListener )
            }
        },
        []
    )
    
    let show_images = readerContext.settings.value.ranobe.show_images

    return (
        <div
            onTouchStart={ handleTouchStart }
            onTouchEnd={ handleTouchEnd }
            onTouchCancel={ handleTouchCancel }
            tabIndex={0}
            className="flex flex-col flex-grow w-full min-h-full items-center px-4 relative ranobe-reader-container mb-12"
        >
            <div
                ref={ ref }
                onClick={ handleClickAction }
                className="flex flex-col w-full h-screen max-w-screen-2xl relative text-white overflow-hidden ranobe-reader-content break-words"
            >
                <div
                    ref={ vPagesRef }
                    className="block h-full w-full absolute top-0"
                >
                    { content.map( ( el ) => {
                        if( el.type == 'img' && show_images == 'no' )
                        {
                            return null
                        }
                        return el
                    })}
                </div>
            </div>
            <div className="flex absolute p-2 left-auto right-auto text-xs text-white -bottom-11">{currentVirtualPageIndex} / {maxVirtualPageIndex}</div>
        </div>
    )
}