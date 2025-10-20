import { RefObject, useContext } from "react"
import { NavLink } from "react-router"
import { ReaderContext } from "@/contexts/ReaderContext"
import ReaderNavigation from "@/components/reader/ReaderNavigation"
import { Close, Settings } from "@/icons"

export default function ReaderHeader({
    headerRef
} : {
    headerRef: RefObject<HTMLDivElement|null>
})
{
    const readerContext = useContext( ReaderContext )

    const visible = readerContext.headerVisible.value// || readerContext.anySidebarVisible.value

    return (
        <div ref={ headerRef } className={`flex flex-row items-stretch flex-grow-0 gap-2 w-full h-[var(--reader-header-height)] bg-zinc-800 sticky z-[3] left-0 transition-top duration-500 ${visible ? 'top-0' : 'top-[var(--reader-header-top)]'}`}>
            <NavLink
                to={ readerContext.currentProductLink.value }
                className="inline-flex flex-row items-center justify-center aspect-square text-white/80 hover:bg-white/5 cursor-pointer"
            >
                <span className="inline-flex w-5 h-5">
                    <Close />
                </span>
            </NavLink>
            { readerContext.firstLoadingDone.value ? (
            <>
                <NavLink
                    to={ readerContext.currentProductLink.value }
                    className="inline-flex flex-col flex-grow-0 py-2 px-4 w-full md:w-auto md:min-w-48 md:max-w-64 gap-y-1 overflow-hidden hover:bg-white/5 cursor-pointer"
                >
                    { ( readerContext?.currentProductEngName.value && readerContext?.currentProductName.value ) ? (
                    <>
                        <span className="inline-block break-all text-white/80 text-sm sm:text-base font-medium truncate">{readerContext.currentProductEngName}</span>
                        <span className="inline-block break-all text-gray-400 text-xs sm:text-sm truncate">{readerContext.currentProductName}</span>
                    </>
                    ) : (
                        readerContext?.currentProductEngName.value ? (
                            <span className="inline-block break-all text-white/80 text-sm sm:text-base font-medium truncate">{readerContext.currentProductEngName}</span>
                        ) : (
                            <span className="inline-block break-all text-white/80 text-sm sm:text-base font-medium truncate">{readerContext.currentProductName}</span>
                        )
                    ) }
                </NavLink>
                <div className="hidden sm:inline-flex">
                    <ReaderNavigation />
                </div>
            </>
            ) : (<></>) }
            <div className="flex flex-row ml-auto gap-2">
                <button
                    onClick={ () => { readerContext.showSettingsSidebar() }}
                    className="inline-flex flex-row items-center justify-center aspect-square text-white/70 hover:bg-white/5 cursor-pointer"
                >
                    <span className="inline-flex w-5 h-5">
                        <Settings />
                    </span>
                </button>
            </div>
        </div>
    )
}