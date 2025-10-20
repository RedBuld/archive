import { RefObject, DependencyList, useState, useRef, useEffect, useCallback } from "react"
import { debounce } from 'lodash'

export function useLazyEffect( effect: Function, deps: DependencyList, wait=300 )
{
    const cleanUp = useRef<Function>( null )
    const effectRef = useRef<Function>( null )
    effectRef.current = useCallback( effect, deps )

    const lazyEffect = useCallback(
        debounce(
            () => ( cleanUp.current = effectRef.current?.() ), wait
        ),
        []
    )

    useEffect( lazyEffect, deps )

    useEffect(
        () => {
            return () => {
                cleanUp.current instanceof Function ? cleanUp.current() : undefined
            }
        }, []
    )
}

export function useOutsideClick(callback: Function)
{
    const ref = useRef<any>(null)

    useEffect(
        () => {
            const handleClick = (event: MouseEvent) => {
                if( !event.target ) return
                if( !ref.current ) return

                if (ref.current && !ref.current.contains(event.target as Node)) {
                    callback()
                }
            }

            document.addEventListener('click', handleClick, true)

            return () => {
                document.removeEventListener('click', handleClick, true)
            }
        },
        [ref,callback]
    )
    return ref
}

export function useOnScreen(ref: RefObject<HTMLElement|null>)
{
    const [isOnScreen, setIsOnScreen] = useState(false)
    const observerRef = useRef<IntersectionObserver | null>(null)
  
    useEffect(
        () => {
            observerRef.current = new IntersectionObserver(
                ([entry]) => {
                    setIsOnScreen(entry.isIntersecting)
                },
                {
                    rootMargin: "-30% 0% -30% 0%",
                    threshold: 0.1
                }
            )
        },
        []
    )
  
    useEffect(
        () => {
            observerRef.current && ref.current && observerRef.current.observe(ref.current)
        
            return () => {
                observerRef.current && observerRef.current.disconnect()
            }
        },
        [ref]
    )
  
    return isOnScreen
}

export function useThrottle( callback: Function, delay: number )
{
    const timeoutRef = useRef<ReturnType<typeof setTimeout>|null>(null!)
    const lastArgsRef = useRef<any>(null!)
  
    const throttledCallback = useCallback(
        ( ...args: any ) => {
            lastArgsRef.current = args
    
            if( !timeoutRef.current )
            {
                timeoutRef.current = setTimeout(
                    () => {
                        callback( ...lastArgsRef.current )
                        timeoutRef.current = null
                        lastArgsRef.current = null
                    },
                    delay
                )
            }
        },
        [callback, delay]
    )
  
    useEffect(
        () => {
            return () => {
                if( timeoutRef.current )
                {
                    clearTimeout(timeoutRef.current)
                }
            }
        },
        []
    )
  
    return throttledCallback
}

export function findClosestInArray( arr: any[], target: any )
{
    let res = arr[0]
    for( let i = 1; i < arr.length; i++ )
    {
        if( Math.abs( arr[i] - target ) <= Math.abs( res - target ) )
        {
            res = arr[i]
        }
        else
        {
            break
        }
    }
    return res
}

export function isObject( item: any )
{
    return ( item && typeof item === 'object' && !Array.isArray(item) )
}
  
  /**
   * Deep merge two objects.
   * @param target
   * @param ...sources
   */
export function mergeDeep( target: Object, ...sources: Object[] )
{
    if( !sources.length )
    {
        return target
    }
    const source = sources.shift()

    if( isObject( target ) && isObject( source ) )
    {
        for( const k in source )
        {
            const key = k as keyof Object
            if( isObject( source[ key ] ) )
            {
                if( !target[key] )
                {
                    Object.assign( target, { [key]: {} } )
                }
                mergeDeep( target[ key ], source[ key ] )
            }
            else
            {
                Object.assign( target, { [ key ]: source[ key ] } )
            }
        }
    }

    return mergeDeep( target, ...sources )
}

export function calculateColumnCount()
{
    let count = 1
    if( typeof window === 'undefined' )
    {
        return 5
    }
    // sm	40rem (640px)	@media (width >= 40rem) { ... }
    if ( window.matchMedia("(min-width: 640px)").matches ) { count = 1 }
    // md	48rem (768px)	@media (width >= 48rem) { ... }
    if ( window.matchMedia("(min-width: 768px)").matches ) { count = 2 }
    // lg	64rem (1024px)	@media (width >= 64rem) { ... }
    if ( window.matchMedia("(min-width: 1024px)").matches ) { count = 3 }
    // xl	80rem (1280px)	@media (width >= 80rem) { ... }
    if ( window.matchMedia("(min-width: 1280px)").matches ) { count = 4 }
    // 2xl	96rem (1536px)	@media (width >= 96rem) { ... }
    if ( window.matchMedia("(min-width: 1536px)").matches ) { count = 5 }

    return count
}

export function humanFileSize(bytes: number, dp:number=2, only_large:boolean = false)
{
    const delimeter = 1024
  
    if( Math.abs(bytes) < delimeter )
    {
        return bytes + ' Байт'
    }
  
    const units = ['Кб', 'Мб', 'Гб', 'Тб', 'Пб', 'Эб', 'Зб', 'Йб']
    let u = -1
    const r = 10**dp
  
    while( Math.round(Math.abs(bytes) * r) / r >= delimeter && u < units.length - 1 )
    {
        bytes /= delimeter
        ++u;
    }

    if( only_large && u < 2)
    {
        dp = 0
    }

    return bytes.toFixed(dp) + ' ' + units[u]
}

export function pluralize( value: number, variants: string[] )
{
    let index = 0
    if( value % 10 === 1 && value % 100 !== 11 )
    {
        index = 0
    }
    else if ( value % 10 >= 2 && value % 10 <= 4 && ( value % 100 < 10 || value % 100 >= 20 ) )
    {
        index = 1
    }
    else
    {
        index = 2
    }
    return variants[ index ]
}