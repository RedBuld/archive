import { useState, useEffect, useContext } from 'react'
import { useParams } from "react-router"
import { AnimeSingle } from "@/types/anime"
import { QueueContext } from "@/contexts/QueueContext"
import { AppContext } from "@/contexts/AppContext"
import { loadAnimeSingle } from '@/api/anime'
import { getSeriaDownloadName, getSeasonDownloadName, savePlaylist } from '@/tools/anime'
import { preprocessDownloadURL } from "@/tools/files"
import Tabs from '@/components/ui/Tabs'
import ArtStatus from '@/components/general/ArtStatus'
import DualTitle from '@/components/general/DualTitle'
import Genres from '@/components/general/Genres'
import AnimeMeta from '@/components/anime/AnimeMeta'
import AnimeButtons from '@/components/anime/AnimeButtons'
import AnimeSeasonsGrid from '@/components/anime/AnimeSeasonsGrid'
import AnimeSeasonsSeries from '@/components/anime/AnimeSeasonsSeries'
import { Loading } from '@/icons'

export default function AnimeSinglePage()
{
    const appContext = useContext(AppContext)
    const queueContext = useContext(QueueContext)

    const { anime_slug } = useParams()

    const displays = [
        {
            'key': 'seasons',
            'name': 'Сезоны'
        },
        {
            'key': 'series',
            'name': 'Серии'
        },
    ]

    const [ anime, setAnime ] = useState<AnimeSingle>( null! )
    const [ loading, setLoading ] = useState<boolean>( anime?.slug ? false : true )

    const name = anime ? anime.name : ''
    const eng_name = anime ? anime.eng_name : ''

    const [ display, setDisplay ] = useState<string>( 'seasons' )

    async function loadData()
    {
        if( !anime_slug ) return
        const loaded = await loadAnimeSingle( anime_slug )
        if( loaded )
        {
            setAnime( loaded )
        }
    }

    function downloadAll()
    {
        if( anime?.download_path )
        {
            let download_url = preprocessDownloadURL( anime.download_path )
            let download_name = `${anime.name}.${anime.ext}`
            queueContext.addToQueue( { 'url': download_url, 'name': download_name } )
        }
        else if( anime.seasons.length > 0 )
        {
            for( const season of anime.seasons )
            {
                if( season.download_path )
                {
                    let download_url = preprocessDownloadURL( season.download_path )
                    let download_name = getSeasonDownloadName( anime, season)
                    queueContext.addToQueue( { 'url': download_url, 'name': download_name } )
                }
                else if( season.series.length > 0 )
                {
                    for( const seria of season.series )
                    {
                        let download_url = preprocessDownloadURL( seria.download_path )
                        let download_name = getSeriaDownloadName( anime, season, seria )
                        queueContext.addToQueue( { 'url': download_url, 'name': download_name } )
                    }
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
        [ anime_slug ]
    )

    useEffect(
        () => {
            if( anime?.slug )
            {
                document.title = `Аниме ${name} — Архив`
                anime?.cover && appContext.setBgImg( `${anime.cover.full}` )
                setLoading( false )
            }
        },
        [ anime ]
    )

    return (
        <div className="md-content flex-grow w-full">
            <div className="composite-header-panel grid relative w-full">
                {/* cover */}
                <ArtStatus loading={loading} cover={anime?.cover} status={anime?.meta?.status} />
                {/* names and studios */}
                <DualTitle loading={loading} name={name} eng_name={eng_name} base_link="anime" object={anime} />
                {/* buttons */}
                <div style={{'gridArea': 'buttons'}} className="inline-flex flex-row items-start gap-3">
                    <AnimeButtons anime={anime} downloadAll={downloadAll} playMedia={() => savePlaylist(anime)} />
                </div>
                {/* genres */}
                <div style={{'gridArea': 'info'}} className="inline-flex flex-wrap items-start">
                    <Genres loading={loading} base_link="/anime" genres={anime?.genres} />
                </div>
                {/* tabs or stats */}
                { loading ? ( <></> ) : (
                    ( anime?.seasons?.length > 1 ) ? (
                        <div style={{'gridArea': 'stats'}} className="inline-flex flex-col">
                            <Tabs tabs={displays} active={display} callback={setDisplay} />
                        </div>
                    ) : (
                        <div style={{'gridArea': 'stats'}} className="flex flex-col">
                            <AnimeMeta loading={loading} meta={anime.download_path?(anime?.meta):(anime.seasons?.[0]?.meta)} />
                        </div>
                    )
                )}
                {/* content */}
                <div style={{'gridArea': 'content'}} className="inline-flex flex-col gap-6">
                    { loading ? (
                        <div className="flex flex-row items-center justify-center p-6">
                            <span className="inline-flex w-12 h-12 text-white">
                                <Loading />
                            </span>
                        </div>
                    ) : (
                        anime?.seasons?.length > 0 ? (
                        <>
                            { ( !anime.mono && display == 'seasons' ) && (<AnimeSeasonsGrid anime={anime} />) }
                            { ( anime.mono || display == 'series' ) && (<AnimeSeasonsSeries anime={anime} mono={anime.mono} />) }
                        </>
                        ) : ( <></> )
                    ) }
                </div>
            </div>
        </div>
    )
}