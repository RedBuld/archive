import { StorageStats, StorageStatsInitial } from "../../types/general"
import { useEffect, useRef, useState } from "react"
import { NavLink } from "react-router"
import { humanFileSize } from "../../tools/general"
import { getCacheStats, getDiskStats } from "../../api/files"
import { InfoDisksLink } from "../../tools/navigation"
import {
    CircularProgress
} from "../../icons"

export default function ShortDiskStats({
    use_link = true,
    redraw
} : {
    use_link?: boolean,
    redraw?: number
})
{
    const cacheUsageRef = useRef<SVGSVGElement>(null)
    const diskUsageRef = useRef<SVGSVGElement>(null)
    const [cacheStats, setCacheStats] = useState<StorageStats>(StorageStatsInitial)
    const [diskStats, setDiskStats] = useState<StorageStats>(StorageStatsInitial)
    
    async function loadCacheStats()
    {
        const data = await getCacheStats()
        setCacheStats(data)
    }
    
    async function loadDiskStats()
    {
        const data = await getDiskStats()
        setDiskStats(data)
    }

    useEffect(
        () => {
            if( cacheUsageRef.current )
            {
                let percent = Math.round(cacheStats.used * 100 / cacheStats.total);
                cacheUsageRef.current.style.setProperty('--progress',`${percent}`)
            }
        },
        [cacheStats]
    )

    useEffect(
        () => {
            if( diskUsageRef.current )
            {
                let percent = Math.round(diskStats.used * 100 / diskStats.total);
                diskUsageRef.current.style.setProperty('--progress',`${percent}`)
            }
        },
        [diskStats]
    )

    // useEffect(
    //     () => {
    //         loadCacheStats()
    //         loadDiskStats()
    //     },
    //     []
    // )
    
    useEffect(
        () => {
            loadCacheStats()
            loadDiskStats()
        },
        [redraw]
    )

    return (
        <Wrapper use_link={use_link}>
            <div className="inline-flex h-full flex-col max-w-1/2 md:flex-row gap-4 items-center">
                <div className="flex w-full sm:w-3/4 md:w-auto md:h-full aspect-square relative order-1">
                    <CircularProgress ref={cacheUsageRef} />
                    <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center">
                        <div className="text-lg text-white font-bold">{Math.round(cacheStats.used/cacheStats.total*100)}%</div>
                    </div>
                </div>
                {/*  */}
                <div className="flex flex-col gap-3 items-center order-2">
                    <div className="text-xl text-white font-bold">Кэш</div>
                    <div className="flex flex-col gap-1 text-white font-medium items-center">
                        <div className="text-sm font-medium">Использовано</div>
                        <div className="text-md">{humanFileSize(cacheStats.used,2)}</div>
                    </div>
                    <div className="flex flex-col gap-1 text-white font-medium items-center">
                        <div className="text-sm font-medium">Всего</div>
                        <div className="text-md">{humanFileSize(cacheStats.total,2)}</div>
                    </div>
                </div>
            </div>
            <div className="inline-flex h-full flex-col max-w-1/2 md:flex-row gap-4 items-center">
                <div className="flex w-full sm:w-3/4 md:w-auto md:h-full aspect-square relative order-1 md:order-2">
                    <CircularProgress ref={diskUsageRef}/>
                    <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center">
                        <div className="text-lg text-white font-bold">{Math.round(diskStats.used/diskStats.total*100)}%</div>
                    </div>
                </div>
                {/*  */}
                <div className="flex flex-col gap-3 items-center order-2 md:order-1">
                    <div className="text-xl text-white font-bold">Диск архива</div>
                    <div className="flex flex-col gap-1 text-white font-medium items-center">
                        <div className="text-sm font-medium">Использовано</div>
                        <div className="text-md">{humanFileSize(diskStats.used,2)}</div>
                    </div>
                    <div className="flex flex-col gap-1 text-white font-medium items-center">
                        <div className="text-sm font-medium">Всего</div>
                        <div className="text-md">{humanFileSize(diskStats.total,2)}</div>
                    </div>
                </div>
            </div>
        </Wrapper>
    )
}

function Wrapper({
    use_link,
    children
} : {
    use_link:boolean,
    children:any
})
{
    const ssb_class = "short-stats-block flex flex-row items-center justify-between w-full md:h-[var(--stats-block-height)] p-4 gap-4 rounded-t-lg"

    return use_link ? (
        <NavLink to={InfoDisksLink} className={ssb_class}>{children}</NavLink>
    ) : (
        <div className={ssb_class}>{children}</div>
    )
}