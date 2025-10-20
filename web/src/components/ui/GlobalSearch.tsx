import { ChangeEvent, KeyboardEvent, useState } from "react"
import { NavLink } from "react-router"
import { Scrollbar } from 'react-scrollbars-custom'
import { nullSearchResults, SearchResults, SearchResult } from "@/types/general"
import { runSearch } from "@/api/general"
import { getAnimePageLink, getMangaPageLink, getRanobePageLink } from "@/tools/navigation"
import { pluralize, useLazyEffect, useOutsideClick } from "@/tools/general"
import { Loading, Close, Search } from '@/icons'

export default function GlobalSearch()
{
    const setClose = () => {
        setOpen(false)
    }

    const [searchTerm, setSearchTerm] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [results, setResults] = useState<SearchResults>(nullSearchResults)
    const [open, setOpen] = useState(false)

    const ref = useOutsideClick( setClose )

    function handleInput(e: ChangeEvent<HTMLInputElement>|KeyboardEvent<HTMLInputElement>)
    {
        let target = e.target as HTMLInputElement
        let new_value = target.value.trim()
        if( new_value != searchTerm )
        {
            setLoading( true )
            setSearchTerm( new_value )
        }
    }

    async function getSearchResults()
    {
        if( !searchTerm )
        {
            return setResults(nullSearchResults)
        }
        if( searchTerm.length < 2 )
        {
            return
        }

        setResults( await runSearch( searchTerm ) )
        setLoading( false )
    }

    useLazyEffect(
        () => {
            getSearchResults()
        },
        [ searchTerm ],
        500
    )

    return (
        <>
            <button
                onClick={ () => setOpen(true) }
                className="inline-flex sm:hidden p-3"
            >
                <span className="flex w-6 h-6 text-white">
                    <Search />
                </span>
            </button>
            <div className={`hidden sm:block fixed z-[10] top-0 left-0 w-screen h-screen bg-zinc-900/50 backdrop-blur-xs duration-300 transition-opacity ${open ? 'opacity-100': 'opacity-0 pointer-events-none'}`}></div>

            <div
                ref={ref}
                className={`${open ? 'flex' : 'hidden'} sm:flex flex-col flex-grow items-end w-full sm:max-w-[35rem] px-4 sm:px-1 py-2 fixed z-[11] top-0 left-0 bg-zinc-900 sm:bg-transparent sm:relative sm:h-[var(--navbar-height)]`}
            >
                <div className={`${open ? 'max-w-full' : 'max-w-64'} flex flex-grow w-full transition-[max-width] duration-300`}>
                    <input
                        onFocus={ () => setOpen(true) }
                        onKeyUp={handleInput}
                        onChange={handleInput}
                        type="search"
                        className="inline-flex rounded-lg px-2 py-1 w-full bg-white/10 border-0 outline-none text-white/90 placeholder:text-white/40"
                        placeholder="Глобальный поиск"
                    />
                    <button
                        onClick={ () => setOpen(false) }
                        className="inline-flex sm:hidden p-1"
                    >
                        <span className="flex w-6 h-6 text-white">
                            <Close />
                        </span>
                    </button>
                </div>
                <div className={`${open ? 'flex' : 'hidden'} flex-col fixed sm:absolute z-[11] top-[var(--navbar-height)] sm:top-full w-full h-[var(--mobile-search-results-height)] sm:h-auto bottom-0 sm:bottom-auto sm:max-h-[45vh] right-0 sm:rounded-md bg-zinc-900 sm:bg-zinc-800 shadow-md overflow-hidden`}>
                    { searchTerm.length < 2 ? (<span className="text-base text-white p-4">Введите минимум 2 символа</span>) : (
                    loading ? (
                        <div className="flex flex-col w-full items-center justify-center p-4">
                            <span className="inline-flex w-8 h-8 text-white">
                                <Loading />
                            </span>
                        </div>
                    ) : (
                        results.found ? (
                            <Scrollbar
                                translateContentSizeYToHolder={true}
                                disableTracksWidthCompensation={true}
                                className="flex flex-grow flex-col w-full h-auto"
                                contentProps={{
                                    renderer: (props) => {
                                        const { elementRef, ...restProps } = props;
                                        let modRestProps = restProps??{}
                                        const key = modRestProps['key']
                                        delete modRestProps['key']
                                        modRestProps['style'] && delete modRestProps['style']['display']
                                        return <div key={key} {...modRestProps} ref={elementRef} className="flex flex-col w-full gap-4 p-4" />;
                                    }
                                }}
                                thumbYProps={{
                                    renderer: (props) => {
                                        const { elementRef, ...restProps } = props;
                                        let modRestProps = restProps??{}
                                        const key = modRestProps['key']
                                        delete modRestProps['key']
                                        modRestProps['style'] && delete modRestProps['style']['background']
                                        modRestProps['className'] += ' bg-sky-700/80'
                                        return <div key={key} {...modRestProps} ref={elementRef} />;
                                    },
                                }}
                            >
                            { results?.anime ? ( <SearchResultElements type="anime" title="Аниме" searchTerm={searchTerm} data={results.anime} close={setClose} /> ) : (<></>) }
                            { results?.manga ? ( <SearchResultElements type="manga" title="Манга" searchTerm={searchTerm} data={results.manga} close={setClose} /> ) : (<></>) }
                            { results?.ranobe ? ( <SearchResultElements type="ranobe" title="Ранобэ" searchTerm={searchTerm} data={results.ranobe} close={setClose} /> ) : (<></>) }
                        </Scrollbar>
                        ) : ( <span className="text-base text-white p-4">Ничего не найдено</span> )
                    ) )}
                </div>
            </div>
        </>
    )
}

function SearchResultElements({
    type,
    title,
    searchTerm,
    data,
    close
} : {
    type: string,
    title: string,
    searchTerm: string,
    data: SearchResult[],
    close: Function
})
{
    const [ showAll, setShowAll ] = useState<boolean>(false)
    const useShowAll = ( data.length ?? 0 ) > 5

    const visible = useShowAll ? ( showAll ? data : data.slice(0,3) ) : data
    const hidden = data.length - visible.length

    return data.length ? (
        <div className="flex flex-col">
            <NavLink
                to={`/${type}?search_term=${searchTerm}`}
                onClick={ () => close() }
                className="flex flex-row justify-between items-center gap-2 px-1 mb-2"
            >
                <span className="inline-flex text-white text-xl">{title}</span>
                <svg className="inline-flex w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7 7 7-7 7"></path>
                </svg>
            </NavLink>
            <div className="flex flex-col gap-2">
                { visible.map( (element) => (
                    <SearchResultElement key={`${element.type}_${element.slug}`} element={element} close={close} />
                ))}
                { ( useShowAll && !showAll ) ? (
                    <button
                        onClick={ () => setShowAll(true) }
                        className="flex flex-row items-center justify-center p-2 group"
                    >
                        <span className="text-sm text-white/60 group-hover:text-white/80">Показать еще {hidden} {pluralize(hidden,['результат','результата','результатов'])}</span>
                    </button>
                ) : (<></>) }
            </div>
        </div>
    ) : <></>
}

function SearchResultElement({
    element,
    close
} : {
    element:SearchResult,
    close: Function
})
{
    function getLink()
    {
        switch (element.type) {
            case 'anime':
            case 'season':
                return getAnimePageLink(element.slug)
            case 'manga':
                return getMangaPageLink(element.slug)
            case 'ranobe':
                return getRanobePageLink(element.slug)
            default:
                return '';
        }
    }

    return (
        <NavLink
            to={ getLink() }
            onClick={ () => close() }
            className="flex flex-row w-full gap-2 p-1.5 bg-zinc-700/40 hover:bg-zinc-600/40 rounded-md"
        >
            <div className="inline-flex flex-col shrink-0 bg-white/10 w-12 h-16 rounded-sm overflow-hidden">
                { element.cover? (
                    <img className="w-full h-full object-cover" src={element.cover} alt="" />
                ) : (<></>) }
            </div>
            <div className="inline-flex flex-col gap-2 p-1">
                <div className="inline-flex text-base font-medium text-white">{element.eng_name}</div>
                <div className="inline-flex text-sm font-normal text-white">{element.name}</div>
            </div>
        </NavLink>
    )
}