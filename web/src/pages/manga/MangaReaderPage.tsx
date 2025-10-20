import { lazy } from "react"

const MangaReader = lazy( () => import('@/components/manga/reader/MangaReader') )

export default function MangaReaderPage()
{
    return ( <MangaReader /> )
}