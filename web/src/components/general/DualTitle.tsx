import { Filterable } from '../../types/general'
import DualTitleMeta from './DualTitleMeta'

export default function DualTitle({
    loading,
    name,
    eng_name,
    base_link,
    object
}:{
    loading: boolean,
    name:string,
    eng_name:string,
    base_link:string,
    object: Filterable
})
{
    return (
        <div style={{'gridArea': 'title'}} className="main-title flex flex-col relative justify-end h-[var(--banner-height)] pb-3">
            { loading ? (
                <div className="inline-flex mb-2 w-3/4 h-[4.5rem] bg-white/60 rounded-lg animate-pulse"></div>
            ) : (
                <div className="inline-flex mb-1 text-2xl sm:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-extrabold text-white drop-shadow">{eng_name}</div>
            )}
            { loading ? (
                <div className="inline-flex mb-1 w-1/3 h-[1.5rem] bg-white/60 rounded-lg animate-pulse"></div>
            ) : (
                <div className="inline-flex mb-1 text-xl font-normal text-white drop-shadow">{name}</div>
            )}
            <div className="flex flex-grow items-start"></div>
            <div className="flex flex-row flex-wrap gap-3">
                { loading ? (
                    <span className="inline-flex font-base w-[8rem] h-[2rem] rounded-md bg-gray-900/40 animate-pulse"></span>
                ) : (
                <>
                    <DualTitleMeta base_link={`/${base_link}`} filter_key="studios" elements={object?.studios} />
                    <DualTitleMeta base_link={`/${base_link}`} filter_key="authors" elements={object?.authors} />
                    <DualTitleMeta base_link={`/${base_link}`} filter_key="voices" elements={object?.voices} />
                </>
                ) }
            </div>
        </div>
    )
}