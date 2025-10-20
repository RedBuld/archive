import { useContext } from "react"
import { ReaderContext } from "@/contexts/ReaderContext"
import { ArrowLeft, ArrowRight } from "@/icons"

export default function ReaderNavigation()
{
    const readerContext = useContext(ReaderContext)

    function movePrev()
    {
        readerContext.setIsBackward( false )
        readerContext.moveToPrevChapter()
    }

    function moveNext()
    {
        readerContext.setIsBackward( false )
        readerContext.moveToNextChapter()
    }

    return (
        <div className="flex flex-row items-stretch justify-between px-2">
            <button
                onClick={ () => movePrev() }
                disabled={ !readerContext.navigationPrevLink.value }
                className={`inline-flex flex-row items-center justify-center aspect-square ${readerContext.navigationPrevLink.value ? 'text-white/70 hover:text-white cursor-pointer hover:bg-white/5' : 'text-white/40 cursor-default'}`}
            >
                <span className="inline-flex w-4 h-4">
                    <ArrowLeft />
                </span>
            </button>
            <div
                onClick={ () => { readerContext.showNavigationSidebar() }}
                className="inline-flex flex-col justify-center items-center gap-y-1 min-w-40 py-1 px-2 cursor-pointer hover:bg-white/5"
            >
                <div className="text-white/80 text-sm sm:text-base font-normal">{ readerContext.currentPositionText.value }</div>
                <div className="text-gray-400 text-xs sm:text-sm font-light">Оглавление</div>
            </div>
            <button
                onClick={ () => moveNext() }
                disabled={ !readerContext.navigationNextLink.value }
                className={`inline-flex flex-row items-center justify-center aspect-square ${readerContext.navigationNextLink.value ? 'text-white/70 hover:text-white cursor-pointer hover:bg-white/5' : 'text-white/40 cursor-default'}`}
            >
                <span className="inline-flex w-4 h-4">
                    <ArrowRight />
                </span>
            </button>
        </div>
    )
}