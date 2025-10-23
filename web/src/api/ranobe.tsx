import { Filters } from "@/types/general"
import {
    Ranobe,
    RanobeSingle,
    ReaderRanobe,
    ReaderRanobeChapter,
} from "@/types/ranobe"
import { loadData, setCached, getCached } from "@/api/general"

// 

export async function loadRanobeList(
    offset: number,
    limit: number,
    filters: Filters
): Promise<Ranobe[]|null>
{
    let url = '/ranobe/list'
    let query: string[] = [
        `limit=${ limit }`,
        `offset=${ offset }`,
    ]
    for( const [ filter, values ] of Object.entries( filters ) )
    {
        if( filter != 'search' && values.length > 0 )
        {
            for( let value of values )
            {
                query.push( `${ filter }[]=${ value }` )
            }
        }
    }
    if( filters[ 'search' ] )
    {
        let search = `${ filters[ 'search' ] }`
        query.push( 'search=' + encodeURIComponent( search ) )
    }
    url = url + `?${ query.join('&') }`

    return loadData<Ranobe[]>( url )
        .then(
            ( response ) => {
                return response
            }
        )
        .catch(
            ( error ) => {
                console.error( error )
                return null
            }
        )
}

export async function loadRanobeFilters(): Promise<Filters|null>
{
    return loadData<Filters>( `/ranobe/filters` )
        .then(
            ( response ) => {
                return response
            }
        )
        .catch(
            ( error ) => {
                console.error( error )
                return null
            }
        )
}

// MANGA SINGLE

export async function loadRanobeSingle(
    ranobe_slug: string
): Promise<RanobeSingle|null>
{
    return loadData<RanobeSingle>( `/ranobe/${ranobe_slug}` )
        .then(
            (response) => {
                return response
            }
        )
        .catch(
            (error) => {
                console.error( error )
                return null
            }
        )
}

// READER

export async function loadRanobeReader(
    ranobe_slug: string
): Promise<ReaderRanobe|null>
{
    return loadData<ReaderRanobe>( `/ranobe/${ranobe_slug}/reader` )
        .then(
            (response) => {
                return response
            }
        )
        .catch(
            (error) => {
                console.error(error)
                return null
            }
        )
}

export async function loadRanobeReaderChapter(
    ranobe_slug: string,
    chapter_id: number
): Promise<ReaderRanobeChapter|null>
{
    return loadData<ReaderRanobeChapter>( `/ranobe/${ranobe_slug}/reader/chapter/${chapter_id}` )
        .then(
            (response) => {
                return response
            }
        )
        .catch(
            (error) => {
                console.error(error)
                return null
            }
        )
}

// 

export function getRanobeLastRead( ranobe?: RanobeSingle ): [ number[], boolean ]
{
    if( ranobe )
    {
        let value = getCached<number[]>( `reader_ranobe_${ranobe.id}_last` )
        if( value )
        {
            return [ value, false ]
        }
        let first_volume = ranobe.volumes[0]
        let first_chapter = first_volume.chapters[0]
        return [
            [ first_volume.number, first_chapter.number ],
            true
        ]
    }
    return [
        [ 1, 1 ],
        true
    ]
}

export function setRanobeLastRead(ranobe_id: number, volume_number: number, chapter_number: number)
{
    setCached( `reader_ranobe_${ranobe_id}_last`, [volume_number,chapter_number] )
}