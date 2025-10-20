import { useState, useEffect, useContext } from 'react'
import { useParams } from "react-router"
import { MangaSingle } from "@/types/manga"
import { QueueContext } from "@/contexts/QueueContext"
import { AppContext } from "@/contexts/AppContext"
import { loadMangaSingle } from '@/api/manga'
import { preprocessDownloadURL } from "@/tools/files"
import { getVolumeDownloadName } from "@/tools/manga"
import Tabs from '@/components/ui/Tabs'
import ArtStatus from '@/components/general/ArtStatus'
import DualTitle from '@/components/general/DualTitle'
import Genres from '@/components/general/Genres'
import MangaButtons from '@/components/manga/MangaButtons'
import MangaVolumesGrid from '@/components/manga/MangaVolumesGrid'
import MangaVolumesChapters from '@/components/manga/MangaVolumesChapters'
import { Loading } from '@/icons'

export default function MangaSinglePage()
{
    const appContext = useContext( AppContext )
    const queueContext = useContext( QueueContext )

    const { manga_slug } = useParams()

    const displays = [
        {
            'key': 'volumes',
            'name': 'Тома'
        },
        {
            'key': 'chapters',
            'name': 'Главы'
        },
    ]

    const [ manga, setManga ] = useState<MangaSingle>( null! )
    const [ loading, setLoading ] = useState<boolean>( manga?.slug ? false : true )

    const name = manga ? manga.name : ''
    const eng_name = manga ? manga.eng_name : ''

    const [ display, setDisplay ] = useState<string>( 'volumes' )

    async function loadData()
    {
        if( !manga_slug ) return
        const loaded = await loadMangaSingle( manga_slug )
        if( loaded )
        {
            setManga( loaded )
        }
    }

    function downloadAll()
    {
        if( manga?.volumes )
        {
            for(const volume of manga.volumes)
            {
                if( volume.filesize > 0 )
                {
                    let download_url = preprocessDownloadURL( volume.download_path )
                    let download_name = getVolumeDownloadName( manga, volume )
                    queueContext.addToQueue( { 'url': download_url, 'name': download_name } )
                }
            }
        }
    }

    useEffect(
        () => {
            loadData()
            // window.addEventListener("manga_single_updated", loadData )
            return () => {
                // window.removeEventListener("manga_single_updated", loadData )
            }
        },
        [manga_slug]
    )

    useEffect(
        () => {
            if( manga?.slug )
            {
                document.title = `Манга ${name} — Архив`
                manga?.cover && appContext.setBgImg( `${manga.cover.full}` )
                setLoading( false )
            }
        },
        [manga]
    )

    return (
        <div className="md-content flex-grow w-full">
            <div className="composite-header-panel grid relative w-full">
                {/* cover */}
                <ArtStatus loading={loading} cover={manga?.cover} status={manga?.meta?.status} />
                {/* names and authors */}
                <DualTitle loading={loading} name={name} eng_name={eng_name} base_link="manga" object={manga} />
                {/* buttons */}
                <div style={{'gridArea': 'buttons'}} className="inline-flex flex-row items-start gap-3">
                    <MangaButtons manga={manga} downloadAll={downloadAll} />
                </div>
                {/* genres */}
                <div style={{'gridArea': 'info'}} className="inline-flex flex-wrap items-start">
                    <Genres loading={loading} base_link="/manga" genres={manga?.genres} />
                </div>
                {/* tabs */}
                <div style={{'gridArea': 'stats'}} className="inline-flex flex-col">
                    <Tabs tabs={displays} active={display} callback={setDisplay} />
                </div>
                {/* content */}
                <div style={{'gridArea': 'content'}} className="inline-flex flex-col gap-6">
                    { loading ? (
                        <div className="flex flex-row items-center justify-center p-6">
                            <span className="inline-flex w-12 h-12 text-white">
                                <Loading />
                            </span>
                        </div>
                    ) : (
                        <>
                            { (manga && display == 'volumes') && (<MangaVolumesGrid manga={manga} />) }
                            { (manga && display == 'chapters') && (<MangaVolumesChapters manga={manga} />) }
                        </>
                    ) }
                </div>
            </div>
        </div>
    )
}