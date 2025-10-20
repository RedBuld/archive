import { ReactElement } from "react";
import { Meta } from "../../types/general";
import { animeResolution, animeFormat } from "../../tools/anime";

export default function AnimeMeta({
    loading,
    meta
} : {
    loading: boolean,
    meta?: Meta
})
{
    let height      = meta ? meta['height']??'' : ''
    let width       = meta ? meta['width']??'' : ''
    let base_format = meta ? meta['format']??'' : ''
    let alt_format  = meta ? meta['alt_format']??'' : ''
    let bit_depth   = meta ? meta['bit_depth']??'' : ''
    const resolution = animeResolution( height, width )
    const format = animeFormat( base_format, alt_format)
    const bits = bit_depth ? `${meta?.bit_depth}bit` : ''

    return (
        <div className="flex flex-row w-full gap-2">
            { loading ? (
            <>
                <AnimeMetaPlaceholder />
                <AnimeMetaPlaceholder />
                <AnimeMetaPlaceholder />
            </>
            ) : (
            <>
                { resolution ? (
                <AnimeMetaValue title="Разрешение">{resolution}</AnimeMetaValue>
                ) : (<></>) }
                { format ? (
                <AnimeMetaValue title="Кодек">{format}</AnimeMetaValue>
                ) : (<></>) }
                { bits ? (
                <AnimeMetaValue title="Цветность">{bits}</AnimeMetaValue>
                ) : (<></>) }
            </>
            ) }
        </div>
    )
}

function AnimeMetaValue({
    title,
    children
} : {
    title?:string,
    children:ReactElement|string
})
{
    const attrs = { 'title': title ? title : undefined }
    return (
        <div {...attrs} className="inline-flex flex-grow justify-center px-2 py-1 rounded-md bg-gray-300 text-black/80 text-sm font-bold">{children}</div>
    )
}

function AnimeMetaPlaceholder()
{
    return (
        <div className="inline-flex flex-grow justify-center h-6 w-1/4 rounded-md bg-gray-300"></div>
    )
}