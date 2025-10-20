import { useState, useContext, useEffect } from 'react'
import { useNavigationType } from 'react-router'
import { isEqual } from 'lodash'
import { Filters } from '@/types/general'
import { Anime } from '@/types/anime'
import { AppContext } from '@/contexts/AppContext'
import { loadAnimeList, loadAnimeFilters } from '@/api/anime'
import { getSession, setSession, delSession } from '@/api/general'
import { calculateColumnCount, useThrottle } from '@/tools/general'
import DataFilters from '@/components/filters/DataFilters'
import AnimeGrid from '@/components/anime/AnimeGrid'
import bgImg from '@/assets/images/anime_index.jpg?url'

export default function AnimeIndexPage()
{
    const data_key = 'anime'
    const filters_key = 'anime_filters'
    const active_filters_key = 'anime_filters_active'
    const has_more_key = 'anime_has_more'
    const per_page = 20

    const location_action = useNavigationType()

    const appContext = useContext( AppContext )

    const back_data = location_action == 'POP' ? getSession<Anime[]>(data_key) : null
    const back_filters = location_action == 'POP' ? getSession<Filters>(filters_key) : null
    const back_active_filters = location_action == 'POP' ? getSession<Filters>(active_filters_key) : null
    const back_has_more = location_action == 'POP' ? getSession<boolean>(has_more_key)??true : true
    
    const [ animes, setAnimes ] = useState<Anime[]>( back_data ?? [] )
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
        if( filtersLoaded ) return

        let new_data = await loadAnimeFilters()
        if( new_data )
        {
            setFilters( new_data )
        }
    }

    function syncActiveFilters( new_filters: Filters )
    {
        setActiveFilters( new_filters )
    }
    
    async function infinityLoading()
    {
        if( loading || !hasMore )
        {
            return
        }

        setLoading( true )
        let new_data = await loadAnimeList( animes.length, per_page, activeFilters )
        if( new_data )
        {
            setAnimes( [ ...animes, ...new_data ] )
            if( new_data.length < per_page )
            {
                setHasMore( false )
            }
        }
        setLoading( false )
    }
        
    async function loadFiltered()
    {
        if( !filtersLoaded || loading ) return

        if( isEqual( activeFilters, activeFiltersShadow ) && ( animes.length > 0 ) )
        {
            return
        }
        
        setLoading( true )
        let new_animes = await loadAnimeList( 0, per_page, activeFilters )
        if( new_animes )
        {
            setAnimes( new_animes )
            setHasMore( true )
        }
        setLoading( false )
        setActiveFiltersShadow( JSON.parse( JSON.stringify( activeFilters ) ) )
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
            setSession( data_key, animes )
        },
        [ animes ]
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
            document.title = `Аниме — Архив`
            appContext.setBgImg(`${bgImg}`)

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
                    <AnimeGrid loading={ loading } columnsCount={ columnsCount } animes={ animes } />
                </div>
            </div>
        </div>
    )
}