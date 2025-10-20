import { useNavigate } from 'react-router'
import { MangaSingle } from '@/types/manga'
import { humanFileSize } from '@/tools/general'
import { getMangaReaderPageLink } from '@/tools/navigation'
import { getMangaLastRead } from '@/api/manga'
import { Loading, Read, Download } from '@/icons'

export default function MangaButtons({ manga, downloadAll }:{ manga?: MangaSingle, downloadAll: Function })
{
    const navigate = useNavigate()
    const [ last_read, new_read ] = getMangaLastRead( manga )
    const last_volume_number = last_read ? last_read[0] ?? 1 : 1
    const last_chapter_number = last_read ? last_read[1] ?? 1 : 1
    const last_image_number = last_read ? last_read[2] ?? 1 : 1
    const link = manga ? getMangaReaderPageLink( manga.slug, last_volume_number, last_chapter_number, last_image_number ) : ''

    let download_size = 0
    if( manga )
    {
        download_size =  manga.foldersize
    }

    function startReading()
    {
        link && navigate(link)
    }

    const base_class = 'inline-flex w-auto flex-grow sm:flex-grow-0 items-center justify-center py-2 px-5 sm:min-w-36 lg:min-w-50 gap-3 rounded-md'
    return (
        <>
            <button
                onClick={ () => downloadAll() }
                disabled={!manga}
                className={`${base_class} ${manga ? 'bg-sky-600/80 hover:bg-sky-500 cursor-pointer' : 'bg-sky-600/80'}`}
            >
                { manga ? (
                <>
                    <span className="inline-flex w-5 lg:w-6 h-5 lg:h-6 text-white">
                        <Download />
                    </span>
                    <span className="inline-block text-white text-base lg:text-lg">Скачать { (download_size > 0) && ( <span className="text-sm">({humanFileSize(download_size,1)})</span> )}</span>
                </>
                ) : (
                    <span className="inline-flex w-5 lg:w-6 h-5 lg:h-6 text-white">
                        <Loading />
                    </span>
                ) }
            </button>
            <button
                onClick={ () => startReading() }
                disabled={!manga}
                className={`${base_class} ${manga ? 'bg-gray-700/80 hover:bg-gray-600 cursor-pointer' : 'bg-gray-700/80'}`}
                // className={`${base_class} bg-gray-700/80 cursor-default`}
            >
                { manga ? (
                <>
                    <span className="inline-flex w-5 lg:w-6 h-5 lg:h-6 text-white">
                        <Read />
                    </span>
                    <span className="hidden sm:inline-flex text-white text-base lg:text-lg">{ new_read ? 'Читать' : 'Продолжить' }</span>
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