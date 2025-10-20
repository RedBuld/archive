import { NavLink } from 'react-router'
import { AnimeSingle, AnimeSeason as Season } from '../../types/anime'
import { getAnimeSeasonPageLink } from '../../tools/navigation'

export default function AnimeSeasonsGrid({
    anime
} : {
    anime:AnimeSingle
})
{
    return (
        <div className="grid w-full max-w-screen-2xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            { anime.seasons?.length ? anime.seasons.map( (season) => { return (
                <AnimeSeasonCard key={season.id} season={season} anime={anime} />
            ) } ) : (
            <span className="col-span-full text-lg text-gray-600 text-center">Ничего не найдено</span>
            ) }
        </div>
    )
}

function AnimeSeasonCard({
    season,
    anime
} : {
    season: Season,
    anime:AnimeSingle
})
{
    const season_link = getAnimeSeasonPageLink( anime.slug, season.slug )

    return (
        <div className="flex flex-row w-full mx-auto">
            <NavLink className="inline-flex flex-col w-full group cursor-pointer" to={season_link}>
                <div className="flex pt-[133%] flex-col bg-white/10 rounded-md relative overflow-hidden">
                    { season?.cover && (
                    <img className="absolute z-[1] top-0 left-0 w-full h-full object-cover object-center" src={`${season.cover.mini?season.cover.mini:season.cover.full}`} alt="" />
                    ) }
                    { season?.meta?.status && (
                    <div className="absolute z-[2] right-2 bottom-2 px-2 py-1 text-xs text-white bg-sky-700 rounded-md">{season?.meta?.status}</div>
                    )}
                </div>
                <div className="flex flex-row items-center justify-between pt-2 gap-2" >
                    <div className="inline-flex flex-col flex-grow gap-1 align-start">
                        <div className="text-white/80 group-hover:text-white/100 text-base leading-5 font-medium">{season?.name}</div>
                        <div className="text-gray-400 group-hover:text-gray-300 text-sm leading-4">{season?.eng_name}</div>
                    </div>
                </div>
            </NavLink>
        </div>
    )
}