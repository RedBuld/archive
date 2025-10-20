export const AnimeIndexPageLink = '/anime'

export function getAnimePageLink(anime_slug: string)
{
    return `${AnimeIndexPageLink}/${anime_slug}/`
}

export function getAnimeSeasonPageLink(anime_slug: string, season_slug: string)
{
    return `${AnimeIndexPageLink}/${anime_slug}/${season_slug}`
}

// 

export const MangaIndexPageLink = '/manga'

export function getMangaPageLink(manga_slug: string)
{
    return `${MangaIndexPageLink}/${manga_slug}/`
}

export function getMangaReaderPageLink(manga_slug: string, volume_number: number|string, chapter_number: number|string, image_number?: number|string)
{
    let link = `${MangaIndexPageLink}/${manga_slug}/read/v/${volume_number}/c/${chapter_number}`
    if( image_number )
    {
        link = `${link}#${image_number}`
    }
    return link
}

// 

export const RanobeIndexPageLink = '/ranobe'

export function getRanobePageLink(ranobe_slug: string)
{
    return `${RanobeIndexPageLink}/${ranobe_slug}/`
}

export function getRanobeReaderPageLink(ranobe_slug: string, volume_number: number|string, chapter_number: number|string)
{
    return `${RanobeIndexPageLink}/${ranobe_slug}/read/v/${volume_number}/c/${chapter_number}`
}

export const InfoPageLink = '/info'
export const InfoDisksLink = '/info/disks'
export const InfoNotificationsLink = '/info/notifications'