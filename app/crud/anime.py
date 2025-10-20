import re
import os
import orjson
import hashlib
import shutil
import filecmp
from sqlalchemy import select, func, or_, and_, case, asc, desc, text
from urllib import parse
from typing import Dict, List, Any
from app import models
from app import schemas
from app.db import DB
from app.db import RD
from app.tools import calculate_hash

ANIME_CACHE_KEYS = {
    'list': 'anime-list',
    'filters': 'anime-filters',
    'single': 'anime-{}',
    'season': 'anime-{}-{}',
}

skip_es_indexing = re.compile("(Season|Сезон) \d+")


async def search(
    search: str
) -> List[ schemas.SearchResult ]:

    results = []

    terms = search.split(' ')
    
    session = DB()

    # 
    
    cases = []
    for term in terms:
        cases.append(
            case(
                (
                    or_(
                        models.Anime.name.ilike(f'%{term}%'),
                        models.Anime.eng_name.ilike(f'%{term}%')
                    ),
                    1
                ),
                else_=0
            )
        )
    
    # 
    
    cases_j = cases.pop(0)
    for _case in cases:
        cases_j = cases_j + _case
    
    # 
    
    anime_query =\
        select(
            models.Anime,
            func.sum( cases_j ).label('relevance')
        )\
        .having(
            text("relevance > 0")
        )\
        .group_by(
            models.Anime.id
        )\
        .order_by(
            desc("relevance")
        )

    # print('#'*20)
    # print( anime_query.compile(compile_kwargs={"literal_binds": True}) )
    # print('#'*20)

    animes: List[ models.Anime ] = session.execute( anime_query ).scalars().all()

    if len(animes) > 0:
        for anime in animes:
            result = schemas.SearchResult()
            result.type = 'anime'
            result.name = anime.name
            result.eng_name = anime.eng_name
            result.slug = anime.slug
            if anime.cover:
                result.cover = anime.cover.cover_link_mini if anime.cover.cover_link_mini != '' else anime.cover.cover_link_full
            elif anime.all_covers:
                result.cover = anime.all_covers[0].cover_link_mini if anime.all_covers[0].cover_link_mini != '' else anime.all_covers[0].cover_link_full
            results.append( result.model_dump() )

    session.close()

    return results


async def get_filters():
    cache_key = ANIME_CACHE_KEYS['filters']
    result = await RD.get( cache_key )

    if not result:

        session = DB()

        studios_query =\
            select(
                models.Studio
            )\
            .join(
                models.StudiosToAnime, models.StudiosToAnime.c.studio_id==models.Studio.id
            )\
            .group_by(
                models.StudiosToAnime.c.studio_id
            )\
            .order_by(
                models.Studio.name.asc()
            )

        voices_query =\
            select(
                models.Voice
            )\
            .join(
                models.VoicesToAnime, models.VoicesToAnime.c.voice_id==models.Voice.id
            )\
            .group_by(
                models.VoicesToAnime.c.voice_id
            )\
            .order_by(
                models.Voice.name.asc()
            )

        genres_query =\
            select(
                models.Genre
            )\
            .join(
                models.GenresToAnime, models.GenresToAnime.c.genre_id==models.Genre.id
            )\
            .group_by(
                models.GenresToAnime.c.genre_id
            )\
            .order_by(
                models.Genre.name.asc()
            )

        studios = session.execute( studios_query ).scalars().all()
        voices = session.execute( voices_query ).scalars().all()
        genres = session.execute( genres_query ).scalars().all()

        filters = {
            'studios': [ schemas.ShortData.model_validate( studio ).model_dump() for studio in studios ],
            'voices': [ schemas.ShortData.model_validate( voice ).model_dump() for voice in voices ],
            'genres': [ schemas.ShortData.model_validate( genre ).model_dump() for genre in genres ],
        }

        result = orjson.dumps( filters )

        await RD.set( cache_key, result )

        session.close()

    return result


async def get_list(
    offset: int = 0,
    limit: int = 50,
    filters: Dict[ str, int ] = {}
) -> List[ schemas.Anime ]:

    session = DB()

    animes_query = select( models.Anime )

    if 'studios' in filters:
        animes_query = animes_query\
            .join( models.StudiosToAnime, models.StudiosToAnime.c.anime_id==models.Anime.id )\
            .filter(
                models.StudiosToAnime.c.studio_id.in_( map( int, filters['studios'] ) )
            )

    if 'voices' in filters:
        animes_query = animes_query\
            .join( models.VoicesToAnime, models.VoicesToAnime.c.anime_id==models.Anime.id )\
            .filter(
                models.VoicesToAnime.c.voice_id.in_( map( int, filters['voices'] ) )
            )

    if 'genres' in filters:
        animes_query = animes_query\
            .join( models.GenresToAnime, models.GenresToAnime.c.anime_id==models.Anime.id )\
            .filter(
                models.GenresToAnime.c.genre_id.in_( map( int, filters['genres'] ) )
            )

    if 'search' in filters:
        terms = str( filters[ 'search' ] ).split(' ')

        cases = []
        for term in terms:
            cases.append(
                case(
                    (
                        or_(
                            models.Anime.name.ilike(f'%{term}%'),
                            models.Anime.eng_name.ilike(f'%{term}%')
                        ),
                        1
                    ),
                    else_=0
                )
            )

        cases_j = cases.pop(0)
        for _case in cases:
            cases_j = cases_j + _case
        
        animes_query = animes_query\
            .add_columns(
                func.sum( cases_j ).label('relevance')
            )\
            .having(
                text("relevance > 0")
            )\
            .order_by(
                desc("relevance")
            )

    animes_query = animes_query\
        .offset(
            offset
        )\
        .limit(
            limit
        )\
        .group_by(
            models.Anime.id
        )\
        .order_by(
            models.Anime.name.asc()
        )

    animes = session.execute( animes_query ).scalars().all()

    result = orjson.dumps([ schemas.Anime.model_validate( anime ).model_dump() for anime in animes ])

    session.close()

    return result


async def get_single(
    anime_slug: str
) -> str:

    cache_key = ANIME_CACHE_KEYS['single'].format( anime_slug )
    result = await RD.get( cache_key )

    if not result:

        session = DB()
        anime = session.execute( 
            select(
                models.Anime
            )\
            .where(
                models.Anime.slug==anime_slug
            )
        ).scalars().one_or_none()

        if anime:
            result = schemas.AnimeFull.model_validate( anime ).model_dump_json()
            await RD.set( cache_key, result, 3600 )
        else:
            result = '{}'

        session.close()

    return result


async def get_season(
    anime_slug: str,
    season_slug: str
) -> str:

    cache_key = ANIME_CACHE_KEYS['season'].format( anime_slug, season_slug )
    result = await RD.get( cache_key )

    if not result:

        session = DB()
        season = session.execute( 
            select(
                models.AnimeSeason
            )\
            .join(
                models.Anime, models.Anime.id==models.AnimeSeason.anime_id
            )\
            .where(
                models.Anime.slug==anime_slug,
                models.AnimeSeason.slug==season_slug
            )\
            .limit(1)
        ).scalars().one_or_none()

        if season:
            result = schemas.AnimeSeasonSingle.model_validate( season ).model_dump_json()
            await RD.set( cache_key, result )
        else:
            result = '{}'

        session.close()

    return result