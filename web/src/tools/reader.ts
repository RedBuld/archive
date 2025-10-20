import { MANGA_CACHE, RANOBE_CACHE } from "@/types/reader"
import { ReaderMangaChapter } from "@/types/manga"
import { ReaderRanobeChapter } from "@/types/ranobe"
import { UnpackedImage, UnpackedImageDimensions } from "@/types/general"
import { cacheFile } from "@/tools/files"
import { parseFB2 } from "@/tools/fb2/parser"
import {
    BlobReader,
    BlobWriter,
    ZipReader
} from "@zip-js/zip-js"

export async function unpackMangaChapter( chapter: ReaderMangaChapter, save_name: string, drawer: Function, success: Function, failure: Function, signal?: AbortSignal, iter: number = 0 )
{
    if( !chapter || iter > 3 )
    {
        return failure()
    }
    
    let images: UnpackedImage[] = []

    // console.log( 'opening cache' )
    const cache = await caches.open( MANGA_CACHE )
    const cachedFile = await cache.match( chapter.download_path )
    // console.log( 'opening cache done' )

    // console.log( 'check cached file' )
    if( !cachedFile )
    {
        await cacheFile( chapter.download_path, save_name, MANGA_CACHE, drawer, signal )
        return unpackMangaChapter( chapter, save_name, drawer, success, failure, signal, ++iter )
    }
    // console.log( 'check cached file done')

    // console.log( 'validating cached file' )
    const data = await cachedFile.blob()
    if( data.size != chapter.filesize )
    {
        await cache.delete( chapter.download_path )
        await cacheFile( chapter.download_path, save_name, MANGA_CACHE, drawer, signal )
        return unpackMangaChapter( chapter, save_name, drawer, success, failure, signal, ++iter )
    }
    // console.log( 'validating cached file done')


    // console.log( 'reading cached file' )
    const zipFileReader = new BlobReader( data )
    const zipReader = new ZipReader( zipFileReader )

    for( const entry of await zipReader.getEntries() )
    {
        if( signal && signal.aborted)
        {
            break
        }
        if( entry )
        {
            let blob = null;
            let ext = entry.filename.split('.').pop()
            let mime = ''
            switch (ext)
            {
                case 'jpg':
                    mime = 'jpeg'
                    break
                default:
                    mime = `${ext}`
                    break
            }
            const writer = new BlobWriter( `image/${mime}` )
            if( entry?.getData )
            {
                await entry?.getData( writer )
                blob = await writer.getData()
            }
            if( blob?.size && blob?.size > 0 )
            {
                const url = window.URL.createObjectURL( blob )
                const dimensions = await getImageDimensions(url)
                
                let image = {
                    name: entry.filename,
                    url: url,
                    width: dimensions.width,
                    height: dimensions.height,
                }
                images.push( image as UnpackedImage )
            }
        }
    }

    await zipReader.close()
    // console.log( 'reading cached file done')

    if( !signal || !signal.aborted )
    {
        return success( images )
    }
    else
    {
        return failure()
    }
}

export async function unpackRanobeChapter( chapter: ReaderRanobeChapter, save_name: string, drawer: Function, success: Function, failure: Function, signal?: AbortSignal, iter: number = 0)
{
    if( !chapter || iter > 3 )
    {
        return failure()
    }

    const cache = await caches.open( RANOBE_CACHE )
    const cachedFile = await cache.match( chapter.download_path )

    if( !cachedFile )
    {
        await cacheFile( chapter.download_path, save_name, RANOBE_CACHE, drawer, signal )
        return unpackRanobeChapter( chapter, save_name, drawer, success, failure, signal, ++iter )
    }

    const data = await cachedFile.blob()
    if( data.size != chapter.filesize )
    {
        await cache.delete( chapter.download_path )
        await cacheFile( chapter.download_path, save_name, RANOBE_CACHE, drawer, signal )
        return unpackRanobeChapter( chapter, save_name, drawer, success, failure, signal, ++iter )
    }
    
    let result_content = ''

    const fb2 = await parseFB2( data )

    for( const section of fb2.sections )
    {
        result_content += section.getContent()
    }

    if( !signal || !signal.aborted )
    {
        return success( result_content )
    } else {
        return failure()
    }
}

function getImageDimensions(url: string): Promise<UnpackedImageDimensions>
{
    return new Promise(
        (resolve, reject) => {
            const img = new Image()

            img.onload = () => {
                const dims: UnpackedImageDimensions = {
                    width: img.naturalWidth,
                    height: img.naturalHeight
                }
                resolve( dims )
            };
        
            img.onerror = (error: string | Event) => {
                console.error(error)
                const dims: UnpackedImageDimensions = {
                    width: 0,
                    height: 0
                }
                reject( dims )
            };
        
            img.src = url
        }
    )
}
