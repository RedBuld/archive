import { Ranobe, RanobeVolume } from "../types/ranobe"

export function getVolumeDownloadName(ranobe: Ranobe, volume: RanobeVolume, ext?: string)
{
    if( ext != '' )
    {
        ext = `.${ext?ext:volume.ext}`
    }
    return `${ranobe.name} - ${volume.number} - ${volume.name}${ext}`
}