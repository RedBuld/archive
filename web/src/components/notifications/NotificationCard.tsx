import { getAnimePageLink, getAnimeSeasonPageLink, getMangaPageLink } from "../../tools/navigation"
import { Notification } from "../../types/general"
import { NavLink } from "react-router"

export default function NotificationCard({
    notification
} : {
    notification: Notification
})
{
    let name: string[] = []
    let eng_name: string[] = []

    notification.routine.reverse().map( (obj_key) => {
        const p = notification.objects[ obj_key ]
        if( p )
        {
            if( p?.name )
            {
                name.push(p.name)
            }
            if( p?.eng_name )
            {
                eng_name.push(p.eng_name)
            }
        }
    })

    let link = ""
    switch (notification.type) {
        case "Anime":
            link = getAnimePageLink(notification.objects["Anime"].slug)
            break;
        case "AnimeSeason":
            link = getAnimeSeasonPageLink(notification.objects["Anime"].slug,notification.objects["AnimeSeason"].slug)
            break;
        case "AnimeSeria":
            link = getAnimeSeasonPageLink(notification.objects["Anime"].slug,notification.objects["AnimeSeason"].slug)
            break;
        case "Manga":
            link = getMangaPageLink(notification.objects["Manga"].slug)
            break;
        case "MangaVolume":
            link = getMangaPageLink(notification.objects["Manga"].slug)
            break;
        case "MangaChapter":
            link = getMangaPageLink(notification.objects["Manga"].slug)
            break;
    }

    return (
        <NavLink to={link} id={`nh_${notification.type}_${notification.id}`} className="grid notification-row p-4 bg-zinc-800/60 hover:bg-zinc-700/60 rounded-lg">
            <div style={{'gridArea':'art'}} className="flex flex-col rounded-md overflow-hidden">
                <div className="flex w-full pt-[133%] relative">
                    <img className="absolute z-[1] top-0 left-0 w-full h-full object-cover" src={notification?.cover ? notification.cover : ""} alt="" />
                </div>
            </div>
            <div style={{'gridArea':'action'}} className="text-md text-white/80">{notification.message}</div>
            <div style={{'gridArea':'eng_name'}} className="text-sm sm:text-md text-white font-medium">{eng_name.join(' - ')}</div>
            <div style={{'gridArea':'name'}} className="text-sm text-white/60">{name.join(' - ')}</div>
            <div style={{'gridArea':'date'}} className="text-sm text-white/50">{notification.datetime_date} {notification.datetime_time}</div>
        </NavLink>
    )
}