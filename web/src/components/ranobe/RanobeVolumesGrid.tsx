import { useContext } from 'react'
import { RanobeSingle, RanobeVolume } from '../../types/ranobe'
import { humanFileSize } from '../../tools/general'
import { QueueContext } from "../../contexts/QueueContext"
import { Download } from '../../icons'

export default function RanobeVolumesGrid({
    ranobe
} : {
    ranobe:RanobeSingle
})
{
    return (
        <div className="grid w-full max-w-screen-2xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            { ranobe.volumes?.length ? ranobe.volumes.map( (volume) => { return (
                <RanobeVolumeCard key={volume.id} volume={volume} ranobe={ranobe} />
            ) } ) : (
            <span className="col-span-full text-lg text-gray-600 text-center">Ничего не найдено</span>
            ) }
        </div>
    )
}

function RanobeVolumeCard({
    volume,
    ranobe
} : {
    volume: RanobeVolume,
    ranobe:RanobeSingle
})
{
    const queueContext = useContext(QueueContext)

    const download_link = volume.filesize > 0 ? volume.download_path : undefined
    const download_name = volume.filesize > 0 ? `${ranobe?.name} - ${volume.name}.${volume.ext}` : undefined

    async function downloadVolume()
    {
        if( !download_link || !download_name )
        {
            return;
        }

        if( volume.filesize > 0 )
        {
            queueContext.addToQueue({'url':download_link,'name':download_name})
        }
    }

    return (
        <div className="flex flex-row w-full mx-auto">
            <div
                onClick={() => downloadVolume()}
                className={`inline-flex flex-col w-full ${download_link?'group cursor-pointer':'cursor-default'}`}
            >
                <div className="flex pt-[133%] flex-col bg-white/10 rounded-md relative overflow-hidden">
                    { volume?.cover && (
                    <img className="absolute z-[1] top-0 left-0 w-full h-full object-cover object-center" src={`${volume.cover.mini?volume.cover.mini:volume.cover.full}`} alt="" />
                    ) }
                    { volume?.status && (
                    <div className="absolute z-[2] right-2 bottom-2 px-2 py-1 text-xs text-white bg-sky-700 rounded-md">{volume.status}</div>
                    )}
                </div>
                <div
                    className="flex flex-row items-center justify-between pt-2 gap-2"
                >
                    <div className="inline-flex flex-col flex-grow gap-1 align-start">
                        <div className="text-white/80 group-hover:text-white/100 text-base leading-5 font-medium">{volume?.name}</div>
                        <div className="text-gray-400 group-hover:text-gray-300 text-sm leading-4">{volume?.eng_name}</div>
                    </div>
                    { volume.filesize > 0 && (
                    <div className="inline-flex flex-col flex-grow gap-1 items-end">
                        <div className="inline-flex w-5 h-5 text-white/50 group-hover:text-white/80">
                            <Download />
                        </div>
                        <div className="inline-flex gap-1 text-xs text-white/50 group-hover:text-white/80"><div className="uppercase">{volume?.ext}</div> / {humanFileSize(volume.filesize,1,true)}</div>
                    </div>
                    ) }
                </div>
            </div>
        </div>
    )
}