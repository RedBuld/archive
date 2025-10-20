import { Manga, MangaVolume } from "../types/manga"

export function getVolumeDownloadName(manga: Manga, volume: MangaVolume, ext?: string)
{
    if( ext != '' )
    {
        ext = `.${ext?ext:volume.ext}`
    }
    return `${manga.name} - ${volume.number} - ${volume.name}${ext}`
}