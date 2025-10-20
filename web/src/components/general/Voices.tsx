import { NavLink } from "react-router"
import { ShortData as Voice } from "../../types/general"

export default function Voices({voices}:{voices:Voice[]|undefined})
{
    return (
        <>
            { voices ? voices.map(
                (voice) => {
                    return (
                        <NavLink key={voice.id} to={`/anime?voices_in[]=${voice.id}`} className="inline-flex text-white/80 text-base font-base py-2 px-3 rounded-md bg-gray-900/40 hover:bg-sky-700/50">{voice.name}</NavLink>
                    )
                }
            ) : (
                <span className="inline-flex font-base w-[8rem] h-[2rem] rounded-md bg-gray-900/40"></span>
            ) }
        </>
    )
}