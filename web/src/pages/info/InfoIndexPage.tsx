
import { useContext, useEffect } from "react"
import { AppContext } from "../../contexts/AppContext"
import LastNotifications from "../../components/notifications/LastNotifications"
import ShortDiskStats from "../../components/files/ShortDiskStats"
import bgImg from '../../assets/images/info_index.jpg?url'

export default function InfoIndexPage()
{
    const appContext = useContext(AppContext)

    useEffect(
        () => {
            document.title = `Информация — Архив`
            appContext.setBgImg(`${bgImg}`)
            // appContext.resetBgImg()
        },
        []
    )
    
    return (
        <div className="flex flex-col items-center w-full">
            <div className="composite-index-page grid relative w-full">
                <div style={{'gridArea': 'filters'}} className="flex flex-col w-full">
                    <ShortDiskStats />
                </div>
                <div style={{'gridArea': 'content'}}>
                    <LastNotifications />
                </div>
            </div>
        </div>
    )
}