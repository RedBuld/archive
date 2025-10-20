import { CachedFile } from "../../types/general"
import { useEffect, useState } from "react"
import { humanFileSize } from "../../tools/general"
import { uncacheFile } from "../../tools/files"
import { Close } from "../../icons"

export default function CachedFilesList({
    caches,
    onChange
} : {
    caches: string[],
    onChange?: Function
})
{
    const [ files, setFiles ] = useState<CachedFile[]>([])

    async function getDetailedStats()
    {
        let f: CachedFile[] = []
        for( let cache_name of caches )
        {
            let z = await getDetailedCacheStats( cache_name )
            f = f.concat( z )
        }
        setFiles( f )
    }

    async function getDetailedCacheStats( cache_name: string ): Promise<CachedFile[]>
    {
        let cache = await window.caches.open( cache_name )
        let requests = await cache.keys()
        let files_async = requests.map(
            ( request: Request ) => {
                return cache.match(request.url)
                    .then(
                        (cachedFile) => {
                            return cachedFile?.blob().then(
                                (blob) => {
                                    let url_parts = request.url.split('download/')
                                    let search_part = decodeURI(`/download/${url_parts[1]}`)
                                    return {
                                        url: request.url,
                                        cache_name: cache_name,
                                        name: localStorage.getItem(search_part)??parseNameFromUrl(request.url),
                                        size: humanFileSize(blob.size,2)
                                    } as CachedFile
                                }
                            )
                        }
                    )
            }
        )
        let files = await Promise.all( files_async )
        return files.filter( (d) => !!d )
    }

    function parseNameFromUrl( url: string )
    {
        let result = ''
        let dataPart = url.split('download/')[1]
        let data = dataPart.split('/')
        let type = data[0]
        if( type == 'Manga' )
        {
            let name = decodeURI(data[1])
            let volume = decodeURI(data[2])
            let chapter = decodeURI(data[3]).replace('r.','').replace('.cbz','')
            result = `${name} - ${volume} - ${chapter}`
        }
        return result
    }

    function deleteFile( url: string, cache_name: string )
    {
        uncacheFile( url, cache_name ).then(
            (deleted) => {
                if( deleted )
                {
                    getDetailedStats()
                    onChange && onChange()
                }
            }
        )
    }

    function deleteAllFiles()
    {
        for( let cache_name of caches )
        {
            window.caches.open( cache_name ).then(
                (cache) => {
                    cache.keys().then(
                        (cachedRequests) => {
                            Promise.all(
                                cachedRequests.map(
                                    (cachedRequest) => {
                                        let dataPart = cachedRequest.url.split('download/')[1]
                                        let search_part = decodeURI(`/download/${dataPart}`)
                                        localStorage.removeItem(search_part)
                                        return cache.delete(cachedRequest.url)
                                    }
                                )
                            ).then(
                                () => {
                                    getDetailedStats()
                                    onChange && onChange()
                                }
                            )
                        }
                    )
                }
            )
        }
    }

    useEffect(
        () => {
            getDetailedStats()
        },
        []
    )

    return (
        <div className="flex flex-col gap-2">
            <button
                className={`flex flex-col p-2 items-center ${files.length ? 'bg-red-800/60 hover:bg-red-700/60 text-white/80 hover:text-white' : 'bg-zinc-600/80 text-zinc-800'} rounded-lg`}
                onClick={deleteAllFiles}
            >Очистить</button>
            { files.map( (file) => {
                return (
                    <div key={file.url} className="flex flex-row p-2 gap-2 items-center bg-zinc-800/60 hover:bg-zinc-700/60 rounded-lg">
                        <div className="inline-flex sm:ml-2 text-base text-white/80 flex-grow">{file.name}</div>
                        <div className="inline-flex text-md text-white/80">{file.size}</div>
                        <div className="inline-flex">
                            <button
                                className="inline-flex p-1 text-white/80 hover:text-white"
                                onClick={ () => { deleteFile(file.url,file.cache_name) }}
                            >
                                <span className="inline-flex w-6 h-6">
                                    <Close />
                                </span>
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}