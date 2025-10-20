import { NavLink } from 'react-router'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { Anime } from '@/types/anime'
import { getAnimePageLink } from '@/tools/navigation'
import SkeletonCard from '@/skeletons/SkeletonCard'

export default function AnimeGrid({
    loading,
    columnsCount,
    animes
} : {
    loading: boolean,
    columnsCount: number,
    animes: Anime[]
})
{
    let c = columnsCount - (animes.length??0 % columnsCount)

    if( c < 0 )
    {
        c = 0
    }

    return (
        <div className={`grid w-full grid-cols-${ columnsCount } gap-8 mb-8 ${ loading ? 'animate-pulse' : '' }`}>
            { ( animes?.length > 0 ) ? (
                animes.map( ( anime ) => { return (
                    <AnimeCard key={anime.id} anime={anime} />
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

function AnimeCard({
    anime
} : {
    anime: Anime
})
{
    return (
        <div className="flex flex-col w-full mx-auto">
            <NavLink
                to={ getAnimePageLink( anime.slug ) }
                className="inline-flex flex-col cursor-pointer w-full group"
            >
                <div className="flex w-full pt-[133%] flex-col bg-white/10 rounded-sm relative overflow-hidden">
                    { ( anime?.covers.length > 1 ) ? (
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
                                { anime.covers.map(
                                    (cover) => {
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
                        anime?.cover ? (
                            <img className="absolute z-[1] top-0 left-0 w-full h-full object-cover object-center" src={`${anime.cover.mini?anime.cover.mini:anime.cover.full}`} alt="" />
                        ) : (
                            <></>
                        )
                    ) }
                </div>
                <div className="flex flex-col w-full align-start pt-2">
                    <span className="text-white/70 group-hover:text-white/100 text-base leading-5 font-medium truncate" title={anime?.name}>{anime?.name}</span>
                    <span className="text-white/50 group-hover:text-white/80 text-sm leading-4 mt-2 truncate" title={anime?.eng_name}>{anime?.eng_name}</span>
                </div>
            </NavLink>
        </div>
    )
}