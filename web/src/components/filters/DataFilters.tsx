import { useEffect, useState, ChangeEvent } from "react"
import { Filters } from "@/types/general"
import FilterSelect from "@/components/filters/FilterSelect"
import { useLazyEffect } from "@/tools/general"


export default function DataFilters({
    filters,
    syncActiveFilters,
    setFiltersLoaded
}: {
    filters: Filters,
    syncActiveFilters: Function,
    setFiltersLoaded: Function
})
{
    const [ filtersFromUrlLoaded, setFiltersFromUrlLoaded ] = useState<boolean>( false )
    const [ firstLoading, setFirstLoading ] = useState<boolean>( true )

    const [ searchTerm, setSearchTerm ] = useState<string>('')
    const [ activeFilters, setActiveFilters ] = useState<Filters>( {} )

    function applyFilters()
    {
        if(syncActiveFilters)
        {
            let new_filters: Filters = {}
            Object.keys( activeFilters ).map( ( filter_key ) => {
                let v = activeFilters[ filter_key ]
                if( v.length != 0 && v[0] != '' )
                {
                    new_filters[ filter_key ] = v
                }
            })
            if( searchTerm != '' )
            {
                new_filters[ 'search' ] = [ searchTerm ]
            }
            else
            {
                delete new_filters[ 'search' ]
            }

            syncActiveFilters( new_filters )
        }
    }

    // 

    function getFiltersFromURL()
    {
        let query = window.location.search
        let _active: Filters = {}
        let _search: string = ""
        if( query )
        {
            query = query.slice( 1 )
        }
        if( query )
        {
            let _filters = query.split( '&' )

            for( let _filter of _filters )
            {
                let _raw: string[] = _filter.split( '=' )
                let _f_key = _raw[ 0 ]
                let _f_value = _raw[ 1 ]
                if( _f_key.endsWith( '_in[]' ) )
                {
                    _f_key = _f_key.slice( 0, -5 )
                    let _f_values = _f_value.split( ',' ).map(
                        ( v ) => {
                            try
                            {
                                return parseInt( v, 10 )
                            }
                            catch(ex)
                            {
                                return null
                            }
                        }
                    ).filter( (v) => v != null )
                    _active[ _f_key ] = _f_values
                }
                else if ( _f_key == 'search_term' )
                {
                    _search = decodeURIComponent( _f_value )
                }
            }
            if( _active )
            {
                setActiveFilters( ( prev: Filters ) => ( { ...prev, ..._active } ) )
            }
            if( _search )
            {
                setSearchTerm( _search )
            }
        }
        setFiltersFromUrlLoaded( true )
    }

    function setFiltersToURL()
    {
        let query: string[] = []
        for( const [ filter, values ] of Object.entries( activeFilters ) )
        {
            if( values.length > 0 )
            {
                query.push( `${ filter }_in[]=${ values.join( ',' ) }` )
            }
        }
        if( searchTerm )
        {
            query.push( `search_term=${ encodeURIComponent( searchTerm ) }` )
        }
        query.length ? history.replaceState( null, '', `?${ query.join('&') }` ) : history.replaceState( null, '', window.location.pathname )
    }

    // 
    
    function handleSearchChange( e: ChangeEvent<HTMLInputElement> )
    {
        setSearchTerm( e?.currentTarget?.value as string )
    }

    useLazyEffect(
        () => {
            applyFilters()
        },
        [ filters, filtersFromUrlLoaded, searchTerm, activeFilters ],
        1000
    )

    useEffect(
        () => {
            if( firstLoading && filtersFromUrlLoaded )
            {
                applyFilters()
                setFiltersLoaded( true )
                setFirstLoading( false )
            }
        },
        [ filtersFromUrlLoaded, searchTerm, activeFilters ]
    )

    useEffect(
        () => {
            filtersFromUrlLoaded && setFiltersToURL()
        },
        [ searchTerm, activeFilters ]
    )

    useEffect(
        () => {
            getFiltersFromURL()
        },
        []
    )

    return (
        <div style={{'gridArea': 'filters'}} className="flex flex-col w-full max-w-screen-2xl mb-3 gap-5 sm:h-[var(--banner-height)]">
            <div className="flex flex-col w-full">
                <input
                    type="text"
                    className="block w-full p-3 rounded-lg shadow border-0 outline-none text-base text-zinc-900 placeholder:text-zinc-600"
                    placeholder="Поиск по разделу"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>
            { Object.keys( filters ).length>0 ? (
            <div className="subtest flex flex-col sm:flex-row w-full gap-5">
                { Object.keys( filters ).map(
                    ( filter_key ) => {
                        if ( filter_key == 'search' )
                        {
                            return
                        }
                        const filter_options = filters[ filter_key ]
                        return (
                            <FilterSelect
                                key={ filter_key }
                                type={ filter_key }
                                options={ filter_options }
                                activeValues={ activeFilters[ filter_key ] }
                                setValue={ ( key: string, val:number[] ) => setActiveFilters( ( prev: Filters ) => ( { ...prev, [key]:val } ) ) }
                            />
                        )
                    }
                ) }
            </div>
            ) : (<></>)}
        </div>
    )
}