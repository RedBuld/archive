import React, { ReactElement } from "react"
import { MANGA_CACHE } from "@/types/reader"
import { ReaderMangaChapter } from "@/types/manga"
// import { ReaderRanobeChapter } from "@/types/ranobe"
import { UnpackedImage, UnpackedImageDimensions } from "@/types/general"
import { cacheFile } from "@/tools/files"
// import { parseFB2 } from "@/tools/fb2/parser"
import {
    BlobReader,
    BlobWriter,
    ZipReader
} from "@zip-js/zip-js"
import { ReaderRanobeChapterElement, ReaderRanobeChapterText } from "../types/ranobe"

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

// export async function unpackRanobeChapter( chapter: ReaderRanobeChapter, save_name: string, drawer: Function, success: Function, failure: Function, signal?: AbortSignal, iter: number = 0)
// {
//     if( !chapter || iter > 3 )
//     {
//         return failure()
//     }

//     const cache = await caches.open( RANOBE_CACHE )
//     const cachedFile = await cache.match( chapter.download_path )

//     if( !cachedFile )
//     {
//         await cacheFile( chapter.download_path, save_name, RANOBE_CACHE, drawer, signal )
//         return unpackRanobeChapter( chapter, save_name, drawer, success, failure, signal, ++iter )
//     }

//     const data = await cachedFile.blob()
//     if( data.size != chapter.filesize )
//     {
//         await cache.delete( chapter.download_path )
//         await cacheFile( chapter.download_path, save_name, RANOBE_CACHE, drawer, signal )
//         return unpackRanobeChapter( chapter, save_name, drawer, success, failure, signal, ++iter )
//     }
    
//     let result_content = ''

//     const fb2 = await parseFB2( data )

//     for( const section of fb2.sections )
//     {
//         result_content += section.getContent()
//     }

//     if( !signal || !signal.aborted )
//     {
//         return success( result_content )
//     } else {
//         return failure()
//     }
// }

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

const SlateToNode: {[index:string]:string} = {
    "paragraph": 'p',
    "heading-one": 'h1',
    "heading-two": 'h2',
    "heading-three": 'h3',
    "heading-four": 'h4',
    "heading-five": 'h5',
    "heading-six": 'h6',
    "block-quote": 'blockquote',
    "bulleted-list": 'ol',
    "numbered-list": 'ul',
    "list-item": 'li',
    "table": 'table',
    "table-row": 'tr',
    "table-cell": 'td',
    "link": 'a',
    "image": 'img',
    "code-block": 'pre'
} as const

const SlateToText: {[index:string]:string} = {
    'bold': 'strong',
    'italic': 'em',
    'strikethrough': 's',
    'underline': 'u',
} as const

export function SlateToReact( el: ReaderRanobeChapterElement|ReaderRanobeChapterText, depth: number = 1, index: string ): ReactElement|null
{
    if( el.hasOwnProperty('type') )
    {
        const element = el as ReaderRanobeChapterElement
        if( SlateToNode[ element.type as string ] )
        {
            let ndepth = depth+1
            let children = Array.from( element.children ).map( (e,i) => SlateToReact( e, ndepth, `${depth}_${i}` ) ).filter( v => v ).flat()
            // if( !children.length && element.type != 'image' ) return null
            const node = React.createElement(
                SlateToNode[ element.type as string ],
                {
                    key: index,
                    className: element.align && `text-${element.align}`,
                },
                children
            )
            return node
        }
    }
    else
    {
        let element = el as ReaderRanobeChapterText
        if( !element.text.trim() ) return null

        let nesting = [ element?.bold&&'bold', element?.italic&&'italic', element?.strikethrough&&'strikethrough', element?.underline&&'underline' ].filter( (v) => v )
        if( nesting.length > 0 )
        {
            let attr = nesting.pop() as string
            let tag = SlateToText[ attr ]
            delete element[ attr as keyof ReaderRanobeChapterText ]
            
            let children = SlateToReact( element, depth+1, `${depth}_${tag}` )

            const node = React.createElement(
                tag,
                {
                    key: `${index}_${tag}`
                },
                children
            )
            return node
        }
        else
        {
            const node = React.createElement(
                'span',
                {
                    key: `${index}_span`
                },
                element.text
            )
            return node
        }
    }
    return null
}