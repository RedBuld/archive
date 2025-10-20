import { Cover } from '../../types/general'
import { Loading } from '../../icons'

export default function ArtStatus({
    loading,
    cover,
    status
}:{
    loading: boolean,
    cover?:Cover,
    status?:string
})
{
    return (
        <div style={{'gridArea': 'art'}} className="flex flex-col main-art h-[var(--banner-height)] sm:h-auto pb-3 sm:pb-0">
            <div className="flex w-full h-full shadow-sm rounded-lg overflow-hidden bg-zinc-600">
                <div className="flex w-full h-full relative">
                    { loading ? (
                        <span className="absolute top-0 left-0 right-0 bottom-0 m-auto w-6 h-6 text-white">
                            <Loading />
                        </span>
                    ) : (
                        <img className="absolute z-[1] top-0 left-0 w-full h-full object-cover" src={cover?.mini ? cover?.mini : cover?.full} alt="" />
                    )}
                    { status ? (
                    <div className="absolute z-[2] right-2 bottom-2 px-2 py-1 text-xs text-white bg-sky-700 rounded-md">{status}</div>
                    ) : (<></>)}
                </div>
            </div>
        </div>
    )
}