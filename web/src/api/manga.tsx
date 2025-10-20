import { Filters } from "@/types/general"
import {
    Manga,
    MangaSingle,
    ReaderManga,
} from "@/types/manga"
import { loadData, setCached, getCached } from "@/api/general"

// 

export async function loadMangaList( offset: number, limit: number, filters: Filters ): Promise<Manga[]|null>
{
    let url = '/manga/list'
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

    return loadData<Manga[]>( url )
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

export async function loadMangaFilters(): Promise<Filters|null>
{
    return loadData<Filters>( `/manga/filters` )
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

export async function loadMangaSingle( path: string ): Promise<MangaSingle|null>
{
    return loadData<MangaSingle>( `/manga/${ path }` )
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

export async function loadReaderManga(manga_slug: string): Promise<ReaderManga|null>
{
    return loadData<ReaderManga>( `/manga/${manga_slug}/reader` )
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

export function getMangaLastRead( manga?: MangaSingle ): [ number[], boolean ]
{
    if( manga )
    {
        let value = getCached<number[]>( `reader_manga_${manga.id}_last` )
        if( value )
        {
            return [ value, false ]
        }
        let first_volume = manga.volumes[0]
        let first_chapter = first_volume.chapters[0]
        return [
            [ first_volume.number, first_chapter.number, 1 ],
            true
        ]
    }
    return [
        [ 1, 1, 1 ],
        true
    ]
}

export function setMangaLastRead(manga_id: number, volume_number: number, chapter_number: number, image_number: number)
{
    setCached( `reader_manga_${manga_id}_last`, [volume_number,chapter_number,image_number] )
}