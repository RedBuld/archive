import { RanobeSingle } from '@/types/ranobe'
import RanobeVolumeChapters from './RanobeVolumeChapters'

export default function RanobeVolumesChapters({
    ranobe
} : {
    ranobe: RanobeSingle
})
{
    return (
        <div className="flex flex-col w-full gap-6">
            { ranobe.volumes.map( (volume) => { return (
                <RanobeVolumeChapters key={volume.id} volume={volume} ranobe={ranobe} />
            ) } ) }
        </div>
    )
}