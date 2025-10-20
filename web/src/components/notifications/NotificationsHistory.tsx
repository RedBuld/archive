import { useEffect, useState } from "react"
import { Notification } from "@/types/general"
import { loadNotifications } from "@/api/notifications"
import { useThrottle } from "@/tools/general"
import NotificationCard from "@/components/notifications/NotificationCard"
import { Loading } from "@/icons"

export default function NotificationsHistory()
{
    const per_page = 20

    const [notifications, setNotifications] = useState<Notification[]>([])

    const [hasMore, setHasMore] = useState<boolean>(true)

    const [loading, setLoading] = useState<boolean>(false)
    
    // infinity scroll listener
    function handleScroll()
    {
        if( ( window.innerHeight + window.scrollY >= ( document.body.scrollHeight - 100 ) ) )
        {
            loadData()
        }
    }

    const throttledScroll = useThrottle( handleScroll, 200 )

    async function loadData()
    {
        if( loading || !hasMore )
        {
            return
        }

        setLoading( true )
        const new_data = await loadNotifications( notifications.length, per_page )
        if( new_data )
        {
            setNotifications( [ ...notifications, ...new_data ] )
            if( new_data.length < per_page )
            {
                setHasMore( false )
            }
        }
        setLoading( false )
    }

    // function deduplicateInitial( previous: Notification[], loaded: Notification[] )
    // {
    //     let res = previous
    //     if( res.length <= getOnce*2 )
    //     {
    //         let deduplicated = loaded.filter(
    //             (loaded_el) => {
    //                 let eq_1 = res.some(
    //                     (previous_el) => {
    //                         return loaded_el.id === previous_el.id
    //                     }
    //                 )
    //                 return !eq_1
    //             }
    //         )
    //         res = res.concat( deduplicated )
    //     }
    //     else
    //     {
    //         res = res.concat( loaded )
    //     }
    //     return res
    // }

    useEffect(
        () => {
            window.addEventListener( 'scroll', throttledScroll )
            return () => {
                window.removeEventListener( 'scroll', throttledScroll )
            }
        },
        [ throttledScroll ]
    )

    useEffect(
        () => {
            loadData()
        },
        []
    )

    return (
        <div className="flex flex-col gap-4">
            { notifications.map( (notification) => (
                <NotificationCard key={`nh_${notification.type}_${notification.id}`} notification={notification} />
            )) }
            { loading ? (
                <div className="flex flex-row items-center justify-center p-6">
                    <span className="inline-flex w-12 h-12 text-white">
                        <Loading />
                    </span>
                </div>
            ) : (<></>)}
        </div>
    )
}