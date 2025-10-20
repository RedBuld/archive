import { Anime, AnimeSingle, AnimeSeason, AnimeSeasonSingle, AnimeSeria } from "../types/anime"
import { preprocessDownloadURL, saveBlob } from "./files"

// 

export function getSeriaDownloadName(anime: Anime, season: AnimeSeason, seria: AnimeSeria, ext?: string)
{
    const single_season = anime?.mono
    if( ext != '' )
    {
        ext = `.${ext?ext:seria.ext}`
    }
    const seria_name = parseInt(seria.name) === seria.number ? seria.name : `${seria.number} - ${seria.name}`
    return single_season ? `${anime.name} - ${seria_name}.${seria.ext}` : `${anime.name} - ${season.name} - ${seria_name}${ext}`
}

export function getSeasonDownloadName(anime: Anime, season: AnimeSeason, ext?: string)
{
    const single_season = anime?.mono
    if( ext != '' )
    {
        ext = `.${ext?ext:season.ext}`
    }
    return single_season ? `${anime.name} - ${season.name}.${season.ext}` : `${anime.name} - ${season.number} - ${season.name}${ext}`
}

// 

export function savePlaylist(source: AnimeSingle|AnimeSeasonSingle): void
{
    let playlist = '#EXTM3U'
    let playlist_name = ''
    let season
    let anime

    if ( source.hasOwnProperty('anime') )
    {
        season = source as AnimeSeasonSingle
        anime = season.anime
        playlist_name = getSeasonDownloadName(anime,season,'m3u8')
        playlist += getSeasonPlaylist(anime,season)
    }
    else
    {
        anime = source as AnimeSingle
        playlist_name = `${anime?.name}.m3u8`
        playlist += getAnimePlaylist(anime)
    }

    if( playlist != '#EXTM3U' )
    {
        const blob = new Blob( [ playlist ], { type: 'application/vnd.apple.mpegurl' } )
        saveBlob( playlist_name, blob )
    }
}

function getAnimePlaylist( anime: AnimeSingle ): string
{
    let playlist = ''
    if( anime.download_path )
    {
        let file_name = anime.name
        let file_url = preprocessDownloadURL( anime.download_path )
        let file_duration = anime.meta['duration']
        playlist += `\n\n#EXTINF:${file_duration},${file_name}\n${file_url}`
    }
    else if( anime.seasons.length > 0 )
    {
        for(let season of anime.seasons)
        {
            playlist += getSeasonPlaylist( anime, season )
        }
    }
    return playlist
}

function getSeasonPlaylist( anime: Anime, season: AnimeSeason ): string
{
    let playlist = ''
    if( season.download_path )
    {
        let file_name = getSeasonDownloadName( anime, season, '' )
        let file_url = preprocessDownloadURL( season.download_path )
        let file_duration = season.meta['duration']
        playlist += `\n\n#EXTINF:${file_duration},${file_name}\n${file_url}`
    }
    else if( season.series.length > 0 )
    {
        for( let seria of season.series )
        {
            let file_name = getSeriaDownloadName( anime, season, seria, '' )
            let file_url = preprocessDownloadURL( seria.download_path )
            let file_duration = seria.meta['duration']
            playlist += `\n\n#EXTINF:${file_duration},${file_name}\n${file_url}`
        }
    }
    return playlist
}

// Anime tools

export function animeFormat( base_format?: string, alt_format?: string ): string
{
    let format = ''
    if( base_format )
    {
        format = base_format
        if( alt_format )
        {
            let type = alt_format.split('/')
            if( type.length > 1 )
            {
                format = format+'/'+type[1]
            }
        }
    }
    return format
}

export function animeResolution(height?: string, width?:string): string
{
    switch(height)
    {
        case undefined:
            return ""
        case "480":
            return "480p"
        case "720":
            return "HD"
        case "1080":
            return "FullHD"
        case "1440":
            return "QHD"
        case "2160":
            return "4K"
        default:
            if( width )
            {
                if( width == "1920" && ( height == "804" || height == "800" ) ) return "FullHD"
                return `${width}x${height}p`
            }
            else
            {
                return `${height}p`
            }
    }
}