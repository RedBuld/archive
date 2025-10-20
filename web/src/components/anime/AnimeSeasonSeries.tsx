import { useContext } from 'react'
import { Anime, AnimeSeason, AnimeSeria } from '../../types/anime'
import { humanFileSize } from '../../tools/general'
import { preprocessDownloadURL } from '../../tools/files'
import { getSeasonDownloadName, getSeriaDownloadName } from '../../tools/anime'
import { QueueContext } from "../../contexts/QueueContext"
import { Download } from '../../icons'

export default function AnimeSeasonSeries({anime, season, mono=false}:{anime:Anime, season:AnimeSeason, mono?: boolean})
{
    const queueContext = useContext(QueueContext)

    async function downloadSeason()
    {
        if( season.download_path )
        {
            let download_url = preprocessDownloadURL( season.download_path )
            let download_name = getSeasonDownloadName( anime, season)
            queueContext.addToQueue( { 'url': download_url, 'name': download_name } )
        }
    }

    return (
        <div
            className="flex flex-col bg-zinc-800/60 rounded-md overflow-hidden"
        >
            { !mono ? (
            <div className="grid py-2 px-2 sm:px-4 bg-zinc-600/60 shadow-md single-file-row">
                <div style={{'gridArea':'name'}} className="text-sm sm:text-md text-white font-medium">{season.name} / {season.eng_name}</div>
                <div style={{'gridArea':'eng_name'}} className="text-xs text-gray-400">{ season?.meta?.status ? season.meta.status : 'Завершен' }</div>
                {season?.ext ? (
                <>
                <div style={{'gridArea':'ext'}} className="inline-flex justify-end text-white/80 self-end justify-end text-base text-medium leading-5 uppercase">{season?.ext}</div>
                <div style={{'gridArea':'size'}} className="inline-flex justify-end text-gray-400 text-sm">{humanFileSize(season.filesize,2,true)}</div>
                </>
                ) : (<></>)}
                {season.download_path ? (
                <div
                    style={{'gridArea':'icon'}}
                    onClick={() => downloadSeason()}
                    className="inline-flex items-center justify-center cursor-pointer"
                >
                    <div className="inline-flex w-5 sm:w-6 h-5 sm:h-6 text-white/50 hover:text-white/80">
                        <Download />
                    </div>
                </div>
                ) : (<></>)}
            </div>
            ) : (<></>) }
            <div className="flex flex-col divide-y divide-zinc-700/20">
                { season?.series && season.series.map( (seria) => {
                    return ( <AnimeSeasonSeria key={`v${season.id}c${seria.id}`} seria={seria} season={season} anime={anime} /> )
                } ) }
            </div>
        </div>
    )
}

function AnimeSeasonSeria({seria, season, anime}:{seria: AnimeSeria, season:AnimeSeason, anime:Anime})
{
    const queueContext = useContext(QueueContext)

    async function downloadSeria()
    {
        if( seria.download_path )
        {
            let download_url = preprocessDownloadURL( seria.download_path )
            let download_name = getSeriaDownloadName( anime, season, seria )
            queueContext.addToQueue( { 'url': download_url, 'name': download_name } )
        }
    }


    return (
        <div
            onClick={() => downloadSeria()}
            className="single-file-row grid cursor-pointer py-3 px-2 sm:px-4 group hover:bg-white/5"
        >
            <span style={{'gridArea':'name'}} className="inline-flex text-white/90 text-sm sm:text-base text-medium">{seria.name}</span>
            <span style={{'gridArea':'eng_name'}} className="inline-flex text-gray-400 text-xs sm:text-sm">{seria.eng_name}</span>
            <span style={{'gridArea':'ext'}} className="inline-flex items-center sm:self-end justify-end text-white/80 group-hover:text-white/100 text-sm sm:text-base text-medium uppercase">{seria?.ext}</span>
            <span style={{'gridArea':'size'}} className="inline-flex items-center sm:self-auto justify-end text-gray-400 group-hover:text-gray-300 text-xs sm:text-sm">{ humanFileSize(seria?.filesize,2,true) }</span>
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