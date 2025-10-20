import { useState, useContext, useEffect } from 'react'
import { useParams } from "react-router"
import { AnimeSeasonSingle } from "@/types/anime"
import { QueueContext } from "@/contexts/QueueContext"
import { AppContext } from "@/contexts/AppContext"
import { loadAnimeSeasonSingle } from '@/api/anime'
import { getSeriaDownloadName, getSeasonDownloadName, savePlaylist } from '@/tools/anime'
import { preprocessDownloadURL } from "@/tools/files"
import ArtStatus from '@/components/general/ArtStatus'
import DualTitle from '@/components/general/DualTitle'
import Genres from '@/components/general/Genres'
import AnimeMeta from '@/components/anime/AnimeMeta'
import AnimeButtons from '@/components/anime/AnimeButtons'
import AnimeSeasonSeries from '@/components/anime/AnimeSeasonSeries'
import { Loading } from '@/icons'

export default function AnimeSeasonPage()
{
    const appContext = useContext( AppContext )
    const queueContext = useContext( QueueContext )

    const { anime_slug, season_slug } = useParams()

    const [ season, setSeason ] = useState<AnimeSeasonSingle>( null! )
    const [ loading, setLoading ] = useState<boolean>( season?.slug ? false : true )

    const name = season ? `${season?.anime?.name} - ${season?.name}` : ''
    const eng_name = season ? `${season?.anime?.eng_name} - ${season?.eng_name}` : ''

    async function loadData()
    {
        if( !anime_slug || !season_slug ) return
        const loaded = await loadAnimeSeasonSingle( `${anime_slug}/${season_slug}` )
        if( loaded )
        {
            setSeason( loaded )
        }
    }

    function downloadAll()
    {
        if( season.download_path )
        {
            let download_url = preprocessDownloadURL( season.download_path )
            let download_name = getSeasonDownloadName( season.anime, season )
            queueContext.addToQueue( { 'url': download_url, 'name': download_name } )
        }
        else if( season.series.length > 0 )
        {
            for( const seria of season.series )
            {
                let download_url = preprocessDownloadURL( seria.download_path )
                let download_name = getSeriaDownloadName( season.anime, season, seria )
                queueContext.addToQueue( { 'url': download_url, 'name': download_name } )
            }
        }
    }

    useEffect(
        () => {
            loadData()
            // window.addEventListener("anime_season_updated", loadData )
            return () => {
                // window.removeEventListener("anime_season_updated", loadData )
            }
        },
        [ anime_slug, season_slug ]
    )

    useEffect(
        () => {
            if( season?.slug )
            {
                document.title = `Аниме ${name} — Архив`
                season?.cover && appContext.setBgImg( `${season.cover.full}` )
                setLoading( false )
            }
        },
        [ season ]
    )

    return (
        <div className="md-content flex-grow w-full">
            <div className="composite-header-panel grid relative w-full">
                {/* cover */}
                <ArtStatus loading={loading} cover={season?.cover} status={season?.meta&&season?.meta['status']} />
                {/* names and authors */}
                <DualTitle loading={loading} name={name} eng_name={eng_name} base_link="anime" object={season} />
                {/* buttons */}
                <div style={{'gridArea': 'buttons'}} className="inline-flex flex-row items-start gap-3">
                    <AnimeButtons anime={season?.anime} season={season} downloadAll={downloadAll} playMedia={() => savePlaylist(season)} />
                </div>
                <div style={{'gridArea': 'info'}} className="inline-flex flex-wrap items-start">
                    <Genres loading={loading} base_link="/anime" genres={season?.genres} />
                </div>
                {/* stats */}
                <div style={{'gridArea': 'stats'}} className="flex flex-col">
                    <AnimeMeta loading={loading} meta={season?.meta} />
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
                        season.download_path ? ( <></> ) : (
                            <AnimeSeasonSeries anime={season.anime} season={season} mono={true} />
                        )
                    ) }
                </div>
            </div>
        </div>
    )
}