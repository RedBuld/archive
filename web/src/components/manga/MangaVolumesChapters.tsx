import { MangaSingle } from '../../types/manga'
import MangaVolumeChapters from './MangaVolumeChapters'

export default function MangaVolumesChapters({
    manga
} : {
    manga: MangaSingle
})
{
    return (
        <div className="flex flex-col w-full gap-6">
            { manga.volumes.map( (volume) => { return (
                <MangaVolumeChapters key={volume.id} volume={volume} manga={manga} />
            ) } ) }
        </div>
    )
}