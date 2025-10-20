import { MANGA_CACHE, RANOBE_CACHE } from "../../types/reader"
import { useContext, useEffect, useState } from "react"
import { AppContext } from "../../contexts/AppContext"
import Tabs from "../../components/ui/Tabs"
import CachedFilesList from "../../components/files/CachedFilesList"
import ShortDiskStats from "../../components/files/ShortDiskStats"
import bgImg from '../../assets/images/info_index.jpg?url'

export default function InfoDisksPage()
{
    const appContext = useContext(AppContext)

    const [redraw,setRedraw] = useState<number>((new Date).getTime())
    const [display,setDisplay] = useState<string>('cache')

    const displays = [
        {
            'key':'cache',
            'name':'Кэш'
        },
        {
            'key':'archive',
            'name':'Архив'
        },
    ]

    function onChange()
    {
        setRedraw((new Date).getTime())
    }

    useEffect(
        () => {
            document.title = `Дисковая статистика — Архив`
            appContext.setBgImg(`${bgImg}`)
            // appContext.resetBgImg()
        },
        []
    )

    return (
        <div className="flex flex-col items-center w-full">
            <div className="composite-index-page grid relative w-full">
                <div style={{'gridArea': 'filters'}} className="flex flex-col w-full">
                    <ShortDiskStats use_link={false} redraw={redraw} />
                </div>
                <div style={{'gridArea': 'content'}}>
                    <div className="mb-3">
                        <Tabs tabs={displays} active={display} callback={setDisplay} />
                    </div>
                    { display == 'cache' ? <CachedFilesList caches={[MANGA_CACHE,RANOBE_CACHE]} onChange={onChange} /> : <></> }
                    { display == 'archive' ? (
                        <div className="flex flex-col p-6 items-center bg-zinc-600/80 text-zinc-800 rounded-lg">В разработке</div>
                    ) : <></> }
                </div>
            </div>
        </div>
    )
}