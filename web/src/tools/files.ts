export async function loadFile( url: string, drawer: Function, signal?: AbortSignal ): Promise<Response|null>
{
    return fetch(url, {signal:signal})
        .then(
            (response) => {
                if( !response?.body )
                {
                    throw Error('no response body')
                }

                const contentEncoding = response.headers.get('content-encoding')
                const contentLength = response.headers.get(contentEncoding ? 'x-file-size' : 'content-length')
                if (contentLength === null) {
                    throw Error('Response size header unavailable')
                }

                let loaded = 0

                const total = parseInt(contentLength, 10)

                const reader = response.body.getReader()
                
                return new ReadableStream({
                    start(controller)
                    {
                        function read()
                        {
                            reader
                                .read()
                                .then( ({done, value}) => {
                                    if( done )
                                    {
                                        controller.close()
                                        return
                                    }
                                    controller.enqueue(value)
                                    loaded += value.byteLength
                                    drawer(loaded, total)
                                    if( !signal || !signal.aborted )
                                    {
                                        read()
                                    }
                                    else
                                    {
                                        throw Error('Cancelled')
                                    }
                                } )
                                .catch( (error) => {
                                    controller.error(error)
                                } )
                        }
                        return read()
                    }
                })
            }
        )
        .then(
            (stream) => {
                if( !signal || !signal.aborted )
                {
                    return new Response( stream )
                }
                return null
            }
        )
}

export function saveBlob( name: string, blob: Blob ): void
{
    const blob_url = window.URL.createObjectURL(blob)
    // 
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = blob_url
    link.download = name
    // 
    document.body.appendChild(link)
    link.click()
    // 
    window.URL.revokeObjectURL(blob_url)
    document.body.removeChild(link)
}

export async function saveFile( url: string, save_name: string, drawer: Function, signal?: AbortSignal ): Promise<void>
{
    return await loadFile(url, drawer, signal)
        .then( async (response) => {
            if( !response ) return
            const blob = await response?.blob()
            if( blob )
            {
                saveBlob( save_name, blob )
            }
        })
        .catch(() => {})
}

export async function cacheFile( url: string, save_name: string, cache_name: string, drawer: Function, signal?: AbortSignal ): Promise<void>
{
    return await loadFile( url, drawer, signal )
        .then( async ( response ) => {
            if( !response ) return
            const blob = await response?.clone()?.blob()
            if( blob )
            {
                const cache = await caches.open( cache_name )
                if( !response.headers.get( 'Content-Type' ) )
                {
                    response.headers.set( 'Content-Type', 'application/octet-stream' )
                }
                if( !response.headers.get( 'Content-Length' ) )
                {
                    response.headers.set( 'Content-Length', `${blob.size}` )
                }
                await cache.put(url, response)
                localStorage.setItem(url, save_name)
            }
        })
        .catch(() => {})
}

export async function uncacheFile( url: string, cache_name: string ): Promise<boolean>
{
    const cache = await caches.open( cache_name )
    return await cache.delete(url)
}

export function preprocessDownloadURL(url: string)
{
    if( !url.startsWith('http') )
    {
        url = window.location.origin+url
    }
    url = url.replace('http://localhost:5173/','https://archive.e2bot.online/')
    return url
}