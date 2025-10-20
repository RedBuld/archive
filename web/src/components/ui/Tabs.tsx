import { useRef, useEffect } from 'react'

interface Tab {
    key: string
    name: string
}

export default function Tabs({ tabs, active, callback, transition = 150 }:{ tabs: Array<Tab>, active: string, callback?: Function, transition?: number })
{
    const lawaRef = useRef<HTMLDivElement|null>(null)
    const activeRef = useRef<HTMLDivElement|null>(null)
    const timeoutRef = useRef<any>(null)

    function calculateLawa( _?: Event, use_transition?: boolean)
    {
        use_transition && resetTransition()
        if( activeRef.current && lawaRef.current )
        {
            if( use_transition )
            {
                lawaRef.current.style.transition=`all ${transition}ms linear`
            }
            let width = activeRef.current.clientWidth
            let height = activeRef.current.clientHeight
            let top = activeRef.current.offsetTop
            let left = activeRef.current.offsetLeft
            lawaRef.current.style.width = width+"px"
            lawaRef.current.style.height = height+"px"
            lawaRef.current.style.top = top+"px"
            lawaRef.current.style.left = left+"px"
        }
    }

    function resetTransition()
    {
        if( timeoutRef.current )
        {
            let k = timeoutRef.current;
            clearTimeout(k);
            timeoutRef.current = null;
        }
        timeoutRef.current = setTimeout( clearTransition, transition )
    }
    
    function clearTransition()
    {
        if( lawaRef.current )
        {
            lawaRef.current.style.transition='none'
        }
    }
    
    useEffect(
        () => {
            calculateLawa(undefined, true)
        },
        [active,activeRef.current]
    )

    useEffect(
        () => {
            window.addEventListener('resize', calculateLawa);
            return () => {
                window.removeEventListener('resize', calculateLawa);
            }
        },
        []
    )

    return (
        <div className="inline-flex flex-row w-full relative gap-x-3 p-1 bg-zinc-700 rounded-lg z-0">
            { tabs.map( (tab) => {
                return (
                    <div
                        key={tab.key}
                        ref={tab.key == active ? activeRef : null}
                        className={`inline-flex w-1/2 box-content justify-center py-2 px-2 text-white font-medium text-sm rounded-md cursor-pointer`}
                        onClick={() => {callback && callback(tab.key)}}
                    >{tab.name}</div>
                )
            } ) }
            <div className="inline-flex absolute rounded-md bg-zinc-500 z-[-1]" ref={lawaRef}></div>
        </div>
    )
}