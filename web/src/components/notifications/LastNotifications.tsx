import { Notification } from "../../types/general"
import { useEffect, useState } from "react"
import { NavLink } from "react-router"
import { loadLastNotifications } from "../../api/notifications"
import { InfoNotificationsLink } from "../../tools/navigation"
import NotificationCard from "./NotificationCard"

export default function LastNotifications()
{
    const [notifications, setNotifications] = useState<Notification[]>( [] )

    async function loadData()
    {
        let new_data = await loadLastNotifications()
        if( new_data )
        {
            setNotifications( new_data )
        }
    }

    useEffect(
        () => {
            loadData()
        },
        []
    )

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row w-full justify-center text-2xl sm:text-4xl lg:text-4xl font-extrabold text-center text-white drop-shadow">Последние уведомления</div>
            { notifications.length > 0 ? (
                notifications.map( (notification) => (
                    <NotificationCard key={`ln_${notification.id}`} notification={notification} />
                ))
            ) : (<></>) }
            <NavLink to={InfoNotificationsLink} className="flex flex-row justify-center p-4 bg-zinc-800/60 hover:bg-zinc-700/60 rounded-lg text-lg md:text-2xl text-white/90">История обновлений</NavLink>
        </div>
    )
}