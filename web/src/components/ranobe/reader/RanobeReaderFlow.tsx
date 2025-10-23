import { useEffect, useRef, useContext, RefObject, ReactElement, MouseEvent } from 'react'
import { ReaderContext } from '@/contexts/ReaderContext'

export default function RanobeReaderFlow({
    content,
    title,
    ref
}:{
    content: ReactElement[],
    title: string,
    ref: RefObject<HTMLDivElement>
})
{
    const readerContext = useContext( ReaderContext )
    const handleKeyboardActionRef = useRef<Function>(null!)
    const handleScrollRef = useRef<Function>(null!)
    
    const progressIndicatorRef = useRef<HTMLDivElement>(null!)

    const left_zone_action = readerContext.settings.value.ranobe.direction == 'ltr' ? readerContext.moveToPrevChapter : readerContext.moveToNextChapter
    const right_zone_action = readerContext.settings.value.ranobe.direction == 'ltr' ? readerContext.moveToNextChapter : readerContext.moveToPrevChapter
    const middle_zone_action = readerContext.toggleHeaderFooter

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

    function handleScroll()
    {
        if( progressIndicatorRef.current )
        {
            progressIndicatorRef.current.style.width = ( ( window.scrollY + window.innerHeight ) / document.documentElement.scrollHeight  * 100 ) + '%'
        }
    }

    // 

    useEffect(
        () => {
            handleKeyboardActionRef.current = handleKeyboardAction
        },
        [ handleKeyboardAction ]
    )

    useEffect(
        () => {
            handleScrollRef.current = handleScroll
        },
        [ handleScroll ]
    )

    useEffect(
        () => {
            readerContext.setFirstLoadingDone( true )

            const kbEventListener = (event: KeyboardEvent) => handleKeyboardActionRef.current( event )
            const scEventListener = () => handleScrollRef.current()

            window.addEventListener( 'keydown', kbEventListener )
            window.addEventListener('scroll', scEventListener )
            return () => {
                window.removeEventListener( 'keydown', kbEventListener )
                window.removeEventListener('scroll', scEventListener )
            }
        },
        []
    )

    let show_images = readerContext.settings.value.ranobe.show_images

    return (
        <div
            tabIndex={0}
            className="flex flex-col items-center w-full relative"
        >
            <div
                className="sticky top-0 left-0 h-1 w-full bg-zinc-700 z-[1]"
            >
                <div
                    ref={progressIndicatorRef}
                    className="absolute top-0 left-0 h-full bg-sky-700"
                ></div>
            </div>
            <div
                onClick={ handleClickAction }
                className="flex flex-col flex-grow w-full min-h-full items-center px-4 relative ranobe-reader-container"
            >
                <div
                    ref={ ref }
                    className="flex flex-col flex-grow w-full min-h-full max-w-screen-2xl relative text-white ranobe-reader-content break-words"
                >
                    { title ? (
                        <header>
                            <h1>{title}</h1>
                        </header>
                    ) : (<></>)}
                    { content.map( ( el ) => {
                        if( el.type == 'img' && show_images == 'no' )
                        {
                            return null
                        }
                        return el
                    })}
                </div>
            </div>
        </div>
    )
}