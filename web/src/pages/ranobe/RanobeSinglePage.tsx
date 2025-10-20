import { useState, useEffect, useContext } from 'react'
import { useParams } from "react-router"
import { RanobeSingle } from "@/types/ranobe"
import { QueueContext } from "@/contexts/QueueContext"
import { AppContext } from "@/contexts/AppContext"
import { loadRanobeSingle } from '@/api/ranobe'
import { preprocessDownloadURL } from "@/tools/files"
import { getVolumeDownloadName } from "@/tools/ranobe"
import Tabs from '@/components/ui/Tabs'
import ArtStatus from '@/components/general/ArtStatus'
import DualTitle from '@/components/general/DualTitle'
import Genres from '@/components/general/Genres'
import RanobeButtons from '@/components/ranobe/RanobeButtons'
import RanobeVolumesGrid from '@/components/ranobe/RanobeVolumesGrid'
import RanobeVolumesChapters from '@/components/ranobe/RanobeVolumesChapters'
import { Loading } from '@/icons'

export default function RanobeSinglePage()
{
    const appContext = useContext( AppContext )
    const queueContext = useContext( QueueContext )

    const { ranobe_slug } = useParams()

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

    const [ ranobe, setRanobe ] = useState<RanobeSingle>( null! )
    const [ loading, setLoading ] = useState<boolean>( ranobe?.slug ? false : true )

    const name = ranobe ? ranobe.name : ''
    const eng_name = ranobe ? ranobe.eng_name : ''

    const [ display, setDisplay ] = useState<string>( 'volumes' )

    async function loadData()
    {
        if( !ranobe_slug ) return
        const loaded = await loadRanobeSingle( ranobe_slug )
        if( loaded )
        {
            setRanobe( loaded )
        }
    }

    function downloadAll()
    {
        if( ranobe?.volumes )
        {
            for(const volume of ranobe.volumes)
            {
                if( volume.filesize > 0 )
                {
                    let download_url = preprocessDownloadURL( volume.download_path )
                    let download_name = getVolumeDownloadName( ranobe, volume )
                    queueContext.addToQueue( { 'url': download_url, 'name': download_name } )
                }
            }
        }
    }

    useEffect(
        () => {
            loadData()
            // window.addEventListener("ranobe_single_updated", loadData )
            return () => {
                // window.removeEventListener("ranobe_single_updated", loadData )
            }
        },
        [ranobe_slug]
    )

    useEffect(
        () => {
            if( ranobe?.slug )
            {
                document.title = `Ранобэ ${name} — Архив`
                ranobe?.cover && appContext.setBgImg( `${ranobe.cover.full}` )
                setLoading( false )
            }
        },
        [ranobe]
    )

    return (
        <div className="md-content flex-grow w-full">
            <div className="composite-header-panel grid relative w-full">
                {/* cover */}
                <ArtStatus loading={loading} cover={ranobe?.cover} status={ranobe?.meta?.status} />
                {/* names and authors */}
                <DualTitle loading={loading} name={name} eng_name={eng_name} base_link="ranobe" object={ranobe} />
                {/* buttons */}
                <div style={{'gridArea': 'buttons'}} className="inline-flex flex-row items-start gap-3">
                    <RanobeButtons ranobe={ranobe} downloadAll={downloadAll} />
                </div>
                {/* genres */}
                <div style={{'gridArea': 'info'}} className="inline-flex flex-wrap items-start">
                    <Genres loading={loading} base_link="/ranobe" genres={ranobe?.genres} />
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
                            { (ranobe && display == 'volumes') && (<RanobeVolumesGrid ranobe={ranobe} />) }
                            { (ranobe && display == 'chapters') && (<RanobeVolumesChapters ranobe={ranobe} />) }
                        </>
                    ) }
                </div>
            </div>
        </div>
    )
}