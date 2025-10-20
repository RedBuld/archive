import { useContext } from 'react'
import { Ranobe, RanobeSingle, RanobeVolume, RanobeChapter } from '../../types/ranobe'
import { humanFileSize } from '../../tools/general'
import { QueueContext } from "../../contexts/QueueContext"
import { Download } from '../../icons'

export default function RanobeVolumeChapters({
    ranobe,
    volume
}:{
    ranobe: RanobeSingle,
    volume: RanobeVolume
})
{
    const queueContext = useContext(QueueContext)

    const download_link = volume.filesize > 0 ? volume.download_path : undefined
    const download_name = `${ranobe?.name} - ${volume.name}.${volume.ext}`

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
        <div
            className="flex flex-col bg-zinc-800/60 rounded-md overflow-hidden"
        >
            <div className="grid py-2 px-2 sm:px-4 bg-zinc-600/60 shadow-md single-file-row">
                <div style={{'gridArea':'name'}} className="text-sm sm:text-md text-white font-medium">{volume.name} / {volume.eng_name}</div>
                <div style={{'gridArea':'eng_name'}} className="text-xs text-gray-400">{ volume.status ? volume.status : 'Завершен' }</div>
                { volume.filesize > 0 && (
                <>
                <div style={{'gridArea':'ext'}} className="inline-flex justify-end text-white/80 self-end justify-end text-sm sm:text-base text-medium uppercase">{volume?.ext}</div>
                <div style={{'gridArea':'size'}} className="inline-flex justify-end text-gray-400 text-sm sm:text-base">{humanFileSize(volume.filesize,1,true)}</div>
                <div
                    style={{'gridArea':'icon'}}
                    onClick={() => downloadVolume()}
                    className="inline-flex items-center justify-center cursor-pointer"
                >
                    <div className="inline-flex w-5 sm:w-6 h-5 sm:h-6 text-white/50 hover:text-white/80">
                        <Download />
                    </div>
                </div>
                </>
                )}
            </div>
            <div className="flex flex-col divide-y divide-zinc-700/20">
                { volume?.chapters && volume.chapters.map( (chapter) => {
                    return ( <RanobeVolumeChapter key={`v${volume.id}c${chapter.id}`} chapter={chapter} volume={volume} ranobe={ranobe} /> )
                } ) }
            </div>
        </div>
    )
}

function RanobeVolumeChapter({chapter, volume, ranobe}:{chapter: RanobeChapter, volume:RanobeVolume,  ranobe:Ranobe})
{
    const queueContext = useContext(QueueContext)

    const download_link = chapter.filesize > 0 ? chapter.download_path : undefined
    const download_name = `${ranobe?.name} - ${volume.name} - ${chapter.name}.${chapter.ext}`

    async function downloadChapter()
    {
        if( !download_link || !download_name )
        {
            return;
        }

        if( chapter.filesize > 0 )
        {
            queueContext.addToQueue({'url':download_link,'name':download_name})
        }
    }


    return (
        <div
            onClick={() => downloadChapter()}
            className="single-file-row grid cursor-pointer py-3 px-2 sm:px-4 group hover:bg-white/5"
        >
            <span style={{'gridArea':'name'}} className="inline-flex text-white/90 text-sm sm:text-base text-medium">{chapter.name}</span>
            <span style={{'gridArea':'eng_name'}} className="inline-flex text-gray-400 text-xs sm:text-sm">{chapter.eng_name}</span>
            <span style={{'gridArea':'ext'}} className="inline-flex items-center sm:self-end justify-end text-white/80 group-hover:text-white/100 text-sm sm:text-base text-medium uppercase">{chapter?.ext}</span>
            <span style={{'gridArea':'size'}} className="inline-flex items-center sm:self-auto justify-end text-gray-400 group-hover:text-gray-300 text-xs sm:text-sm">{ humanFileSize(chapter?.filesize,1,true) }</span>
            <div
                style={{'gridArea':'icon'}}
                className="inline-flex items-center justify-center cursor-pointer"
            >
                <div className="inline-flex w-5 sm:w-6 h-5 sm:h-6 text-white/50 group-hover:text-white/80">
                    <Download />
                </div>
            </div>
        </div>
    )
}