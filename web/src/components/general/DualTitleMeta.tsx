import { NavLink } from "react-router"
import { ShortData } from "../../types/general"

export default function DualTitleMeta({
    base_link,
    filter_key,
    elements
} : {
    base_link: string,
    filter_key: string,
    elements?:ShortData[]
})
{
    return elements ? (
        <>
            { elements.map(
                (element) => {
                    return (
                        <NavLink key={element.id} to={`${base_link}?${filter_key}_in[]=${element.id}`} className="inline-flex text-white/80 text-base font-base py-2 px-3 rounded-md bg-gray-900/40 hover:bg-sky-700/50">{element.name}</NavLink>
                    )
                }
            ) }
        </>
    ) : <></>
}