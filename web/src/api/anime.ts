import { Filters } from "@/types/general"
import {
    Anime,
    AnimeSingle,
    AnimeSeasonSingle,
} from "@/types/anime"
import { loadData } from "./general"

// ANIME

export async function loadAnimeList( offset: number, limit: number, filters: Filters ): Promise<Anime[]|null>
{
    let url = '/anime/list'
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

    return loadData<Anime[]>( url )
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

export async function loadAnimeFilters(): Promise<Filters|null>
{
    return loadData<Filters>( `/anime/filters` )
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

// ANIME SINGLE

export async function loadAnimeSingle( path: string ): Promise<AnimeSingle|null>
{
    return loadData<AnimeSingle>( `/anime/${path}` )
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

// ANIME SEASON

export async function loadAnimeSeasonSingle( path: string ): Promise<AnimeSeasonSingle|null>
{
    return loadData<AnimeSeasonSingle>( `/anime/${path}` )
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