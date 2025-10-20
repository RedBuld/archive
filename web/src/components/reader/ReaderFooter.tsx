import { RefObject, useContext } from "react"
import { ReaderContext } from "@/contexts/ReaderContext"
import ReaderNavigation from '@/components/reader/ReaderNavigation'

export default function ReaderFooter({
    footerRef,
} : {
    footerRef: RefObject<HTMLDivElement|null>
})
{
    const readerContext = useContext(ReaderContext)

    let visible = readerContext.footerVisible.value// || readerContext.anySidebarVisible.value

    return (
        <div
            ref={footerRef}
            className={`flex sm:hidden flex-col items-stretch flex-grow-0 w-full h-[var(--reader-header-height)] bg-zinc-800 sticky z-[3] left-0 transition-bottom duration-500 ${visible ? 'bottom-0' : 'bottom-[var(--reader-header-top)]'}`}
        >
            <ReaderNavigation />
        </div>
    )
}