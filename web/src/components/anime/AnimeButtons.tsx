import { Anime, AnimeSeason } from '../../types/anime'
import { humanFileSize } from '../../tools/general'
import { Loading, Play, Download } from '../../icons'

export default function AnimeButtons({ anime, season, downloadAll, playMedia }:{ anime?: Anime, season?: AnimeSeason, downloadAll: Function, playMedia: Function })
{
    let download_size = 0
    if( season )
    {
        download_size =  season.filesize ? season.filesize : season.foldersize
    }
    else if( anime )
    {
        download_size =  anime.filesize ? anime.filesize : anime.foldersize
    }
    const base_class = 'inline-flex w-auto flex-grow sm:flex-grow-0 items-center justify-center py-2 px-5 sm:min-w-36 lg:min-w-50 gap-3 rounded-md'
    return (
        <>
            <button
                onClick={ () => downloadAll() }
                disabled={!anime}
                className={`${base_class} ${anime ? 'bg-sky-600/80 hover:bg-sky-500 cursor-pointer' : 'bg-sky-600/80'}`}
            >
                { anime ? (
                <>
                    <span className="inline-flex w-5 lg:w-6 h-5 lg:h-6 text-white">
                        <Download />
                    </span>
                    <span className="inline-block text-white text-base lg:text-lg">Скачать  { (download_size > 0) && ( <span className="text-sm">({humanFileSize(download_size,1)})</span> )}</span>
                </>
                ) : (
                    <span className="inline-flex w-5 lg:w-6 h-5 lg:h-6 text-white">
                        <Loading />
                    </span>
                ) }
            </button>
            <button
                onClick={ () => anime && playMedia(anime,season) }
                disabled={!anime}
                className={`${base_class} ${anime ? 'bg-gray-700/80 hover:bg-gray-600 cursor-pointer' : 'bg-gray-700/80'}`}
            >
                { anime ? (
                <>
                    <span className="inline-flex w-5 lg:w-6 h-5 lg:h-6 text-white">
                        <Play />
                    </span>
                    <span className="hidden sm:inline-flex text-white text-base lg:text-lg">Смотреть</span>
                </>
                ) : (
                    <span className="inline-flex w-5 lg:w-6 h-5 lg:h-6 text-white">
                        <Loading />
                    </span>
                ) }
            </button>
        </>
    )
}