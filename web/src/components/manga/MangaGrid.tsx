import { NavLink } from 'react-router'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { Manga } from '@/types/manga'
import { getMangaPageLink } from '@/tools/navigation'
import SkeletonCard from '@/skeletons/SkeletonCard'

export default function MangaGrid({
    loading,
    columnsCount,
    mangas
} : {
    loading: boolean,
    columnsCount: number,
    mangas: Manga[]
})
{
    let c = columnsCount - (mangas.length??0 % columnsCount)

    if( c < 0 )
    {
        c = 0
    }

    return (
        <div className={`grid w-full grid-cols-${columnsCount} gap-8 mb-8 ${loading ? 'animate-pulse' : '' }`}>
            { ( mangas?.length > 0 ) ? (
                mangas.map( ( manga ) => { return (
                    <MangaCard key={ manga.id } manga={ manga } />
                ) } )
            ) : (
                !loading ? (
                    <span className="col-span-full text-lg text-gray-600 text-center">Ничего не найдено</span>
                ) : (<></>)
            ) }
            { loading ? (
                [...Array(c)].map(
                    ( _, index ) => {
                        return (
                            <SkeletonCard key={ index }/>
                        )
                    }
                )
            ) : (<></>) }
        </div>
    )
}

function MangaCard({
    manga
} : {
    manga: Manga
})
{
    return (
        <div className="flex flex-row w-full mx-auto">
            <NavLink
                to={ getMangaPageLink( manga.slug ) }
                className="inline-flex flex-col cursor-pointer w-full group"
            >
                <div className="flex w-full pt-[133%] flex-col bg-white/10 rounded-sm relative overflow-hidden">
                    { ( manga?.covers.length > 1 ) ? (
                        <div className="absolute z-[1] top-0 left-0 w-full h-full">
                            <Swiper
                                modules={ [ Autoplay ] }
                                className="w-full h-full"
                                spaceBetween={ 0 }
                                slidesPerView={ 1 }
                                speed={ 1000 }
                                autoplay={{ delay: 2000, pauseOnMouseEnter: true }}
                                loop={ true }
                            >
                                { manga.covers.map(
                                    ( cover ) => {
                                        return (
                                            <SwiperSlide key={ cover.full }>
                                                <img className="w-full h-full object-cover object-center" src={`${cover.mini?cover.mini:cover.full}`} loading="lazy" alt="" />
                                            </SwiperSlide>
                                        )
                                    }
                                ) }
                            </Swiper>
                        </div>
                    ) : (
                        manga?.cover ? (
                            <img className="absolute z-[1] top-0 left-0 w-full h-full object-cover object-center" src={`${manga.cover.mini?manga.cover.mini:manga.cover.full}`} alt="" />
                        ) : (
                            <></>
                        )
                    ) }
                </div>
                <div className="flex flex-col align-start pt-2">
                    <span className="text-white/70 group-hover:text-white/100 text-base leading-5 font-medium truncate" title={manga?.name}>{manga?.name}</span>
                    <span className="text-white/50 group-hover:text-white/80 text-sm leading-4 mt-2 truncate" title={manga?.eng_name}>{manga?.eng_name}</span>
                </div>
            </NavLink>
        </div>
    )
}