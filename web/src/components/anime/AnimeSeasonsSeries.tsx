import { AnimeSingle } from '../../types/anime'
import AnimeSeasonSeries from './AnimeSeasonSeries'

export default function AnimeSeasonsSeries({anime, mono=false}:{anime:AnimeSingle, mono?: boolean})
{
    return (
        <div className="flex flex-col w-full gap-6">
            { anime?.seasons && anime.seasons.map( (season) => { return (
                <AnimeSeasonSeries key={season.id} season={season} anime={anime} mono={mono}/>
            ) } ) }
        </div>
    )
}