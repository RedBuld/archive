import { NavLink } from "react-router"
import { ShortData } from "../../types/general"

export default function Genres({
    loading,
    base_link,
    genres
} : {
    loading: boolean,
    base_link: string,
    genres:ShortData[]|undefined
})
{
    return (
        <div className="flex flex-row flex-wrap gap-3">
            { loading ? (
                <span className="inline-flex w-16 h-6 rounded-md text-white/80 bg-gray-700/80 animate-pulse"></span>
            ) : (
                <>
                    { genres ? genres.map(
                        (genre) => {
                            return (
                                <NavLink key={`mg_${genre.id}`} to={`${base_link}?genres_in[]=${genre.id}`} className="inline-flex py-1 px-2 rounded-md text-white/80 hover:text-white text-[0.65rem] uppercase bg-zinc-700/30 hover:bg-sky-500/80">{genre.name}</NavLink>
                            )
                        }
                    ) : ( <></> ) }
                </>
            ) }
        </div>
    )
}