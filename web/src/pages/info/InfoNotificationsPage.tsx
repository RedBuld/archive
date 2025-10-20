import NotificationsHistory from "../../components/notifications/NotificationsHistory"
import { useContext, useEffect } from "react"
import { AppContext } from "../../contexts/AppContext"
import bgImg from '../../assets/images/info_index.jpg?url'

export default function InfoNotificationsPage()
{
    const appContext = useContext(AppContext)

    useEffect(
        () => {
            document.title = `История обновлений — Архив`
            appContext.setBgImg(`${bgImg}`)
            // appContext.resetBgImg()
        },
        []
    )

    return (
        <div className="flex flex-col items-center w-full">
            <div className="composite-index-page grid relative w-full">
                <div style={{'gridArea': 'filters'}} className="flex flex-grow justify-center items-center w-full sm:h-[var(--stats-block-height)]">
                    <div className="inline-flex text-2xl sm:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-extrabold text-white drop-shadow">История обновлений</div>
                </div>
                <div style={{'gridArea': 'content'}}>
                    <NotificationsHistory />
                </div>
            </div>
        </div>
    )
}