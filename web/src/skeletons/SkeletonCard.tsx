export default function SkeletonCard()
{
    return (
        <div className="flex flex-row w-full mx-auto ">
            <div className="inline-flex flex-col w-full">
                <div className="flex pt-[133%] flex-col rounded-sm relative overflow-hidden ">
                    <div className="absolute z-[1] top-0 left-0 w-full h-full bg-white/15"></div>
                </div>
                <div className="flex flex-col align-start pt-2">
                    <span className=" bg-white/10 rounded-lg h-[var(--text-base)] mt-1 w-5/6"></span>
                    <span className=" bg-white/10 rounded-lg h-[var(--text-sm)] w-4/6 mt-3"></span>
                </div>
            </div>
        </div>
    )
}