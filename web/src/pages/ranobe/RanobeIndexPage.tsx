import { useState, useContext, useEffect } from 'react'
import { useNavigationType } from 'react-router'
import { isEqual } from 'lodash'
import { Filters } from '@/types/general'
import { Ranobe } from '@/types/ranobe'
import { AppContext } from '@/contexts/AppContext'
import { loadRanobeList, loadRanobeFilters } from '@/api/ranobe'
import { getSession, setSession, delSession } from '@/api/general'
import { calculateColumnCount, useThrottle } from '@/tools/general'
import DataFilters from '@/components/filters/DataFilters'
import RanobeGrid from '@/components/ranobe/RanobeGrid'
import bgImg from '@/assets/images/ranobe_index.jpg?url'

export default function RanobeIndexPage()
{
    const data_key = 'ranobe'
    const filters_key = 'ranobe_filters'
    const active_filters_key = 'ranobe_filters_active'
    const has_more_key = 'ranobe_has_more'
    const per_page = 20

    const location_action = useNavigationType()
    
    const appContext = useContext( AppContext )
    
    const back_data = location_action == 'POP' ? getSession<Ranobe[]>(data_key) : null
    const back_filters = location_action == 'POP' ? getSession<Filters>(filters_key) : null
    const back_active_filters = location_action == 'POP' ? getSession<Filters>(active_filters_key) : null
    const back_has_more = location_action == 'POP' ? getSession<boolean>(has_more_key)??true : true
    
    const [ ranobes, setRanobes ] = useState<Ranobe[]>( back_data ?? [] )
    const [ filters, setFilters ] = useState<Filters>( back_filters ?? {} )
    
    const [ activeFilters, setActiveFilters ] = useState<Filters>( back_active_filters ?? {} )
    const [ activeFiltersShadow, setActiveFiltersShadow ] = useState<Filters>( activeFilters )

    const [ loading, setLoading ] = useState<boolean>( false )
    const [ hasMore, setHasMore ] = useState<boolean>( back_has_more )
    const [ filtersLoaded, setFiltersLoaded ] = useState<boolean>( !!back_filters )
    
    const [ columnsCount, setColumnsCount ] = useState( calculateColumnCount() )

    // infinity scroll listener
    function handleScroll()
    {
        if( ( window.innerHeight + window.scrollY >= ( document.body.scrollHeight - 100 ) ) )
        {
            infinityLoading()
        }
    }
    
    const throttledScroll = useThrottle( handleScroll, 200 )

    async function loadFilters()
    {
        let new_data = await loadRanobeFilters()
        if( new_data )
        {
            setFilters( new_data )
        }
    }

    function syncActiveFilters( new_filters: Filters )
    {
        setActiveFilters( new_filters )
    }

    async function loadFiltered()
    {
        if( !filtersLoaded ) return

        if( isEqual( activeFilters, activeFiltersShadow ) && ( ranobes.length > 0 ) )
        {
            return
        }

        setLoading( true )
        let new_data = await loadRanobeList( 0, per_page, activeFilters )
        if( new_data )
        {
            setRanobes( new_data )
            setHasMore( true )
        }
        setLoading( false )
        setActiveFiltersShadow( JSON.parse( JSON.stringify( activeFilters ) ) )
    }

    async function infinityLoading()
    {
        if( loading || !hasMore )
        {
            return
        }

        setLoading( true )
        let new_data = await loadRanobeList( ranobes.length, per_page, activeFilters )
        if( new_data )
        {
            setRanobes( [ ...ranobes, ...new_data ] )
            if( new_data.length < per_page )
            {
                setHasMore( false )
            }
        }
        setLoading( false )
    }

    function clearSession()
    {
        delSession(data_key)
        delSession(filters_key)
        delSession(active_filters_key)
        delSession(has_more_key)
    }

    useEffect(
        () => {
            loadFiltered()
        },
        [ activeFilters ]
    )

    useEffect(
        () => {
            setSession( active_filters_key, activeFilters )
        },
        [ activeFilters ]
    )

    useEffect(
        () => {
            setSession( filters_key, filters )
        },
        [ filters ]
    )

    useEffect(
        () => {
            setSession( data_key, ranobes )
        },
        [ ranobes ]
    )

    useEffect(
        () => {
            setSession( has_more_key, hasMore )
        },
        [ hasMore ]
    )

    useEffect(
        () => {
            window.addEventListener( 'scroll', throttledScroll )
            return () => {
                window.removeEventListener( 'scroll', throttledScroll )
            }
        },
        [ throttledScroll ]
    )

    useEffect(
        () => {
            document.title = `Ранобэ — Архив`
            appContext.setBgImg( `${bgImg}` )

            loadFilters()
            
            window.addEventListener( 'resize', () => setColumnsCount( calculateColumnCount() ) )
            window.addEventListener( 'beforeunload', clearSession )
            return () => {
                window.removeEventListener( 'resize', () => setColumnsCount( calculateColumnCount() ) )
                window.removeEventListener( 'beforeunload', clearSession )
            }
        },
        []
    )

    return (
        <div className="flex flex-col items-center w-full">
            <div className="composite-index-page grid relative w-full">
                <DataFilters filters={ filters } syncActiveFilters={ syncActiveFilters } setFiltersLoaded={ setFiltersLoaded } />
                <div style={{'gridArea': 'content'}} className="flex flex-col w-full">
                    <RanobeGrid loading={ loading } columnsCount={ columnsCount } ranobes={ ranobes } />
                </div>
            </div>
        </div>
    )
}

