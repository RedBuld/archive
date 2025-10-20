import orjson
from sqlalchemy import select, func, or_, and_, case, asc, desc, text
from typing import Dict, List, Any
from app import models
from app import schemas
from app.db import DB
from app.db import RD
from app.tools import calculate_hash


MANGA_CACHE_KEYS = {
    'list': 'ranobe-list',
    'filters': 'ranobe-filters',
    'single': 'ranobe-{}',
    'reader': 'ranobe-{}-reader',
}


async def search(
    search: str
) -> List[ schemas.SearchResult ]:

    results = []

    terms = search.split(' ')

    session = DB()

    # 
    
    ranobe_cases = []
    for term in terms:
        ranobe_cases.append(
            case(
                (
                    or_(
                        models.Ranobe.name.ilike(f'%{term}%'),
                        models.Ranobe.eng_name.ilike(f'%{term}%')
                    ),
                    1
                ),
                else_=0
            )
        )
    
    # 
    
    ranobe_cases_j = ranobe_cases.pop(0)
    for _case in ranobe_cases:
        ranobe_cases_j = ranobe_cases_j + _case

    # 
    
    ranobe_query =\
        select(
            models.Ranobe,
            func.sum( ranobe_cases_j ).label('relevance')
        )\
        .having(
            text("relevance > 0")
        )\
        .group_by(
            models.Ranobe.id
        )\
        .order_by(
            desc("relevance")
        )

    # print('#'*20)
    # print( ranobe_query.compile(compile_kwargs={"literal_binds": True}) )
    # print('#'*20)

    ranobes: List[ models.Ranobe ] = session.execute( ranobe_query ).scalars().all()

    if len( ranobes ) > 0:
        for ranobe in ranobes:
            result = schemas.SearchResult()
            result.type = 'ranobe'
            result.name = ranobe.name
            result.eng_name = ranobe.eng_name
            result.slug = ranobe.slug
            if ranobe.cover:
                result.cover = ranobe.cover.cover_link_mini if ranobe.cover.cover_link_mini != '' else ranobe.cover.cover_link_full
            elif ranobe.all_covers:
                result.cover = ranobe.all_covers[0].cover_link_mini if ranobe.all_covers[0].cover_link_mini != '' else ranobe.all_covers[0].cover_link_full
            results.append( result.model_dump() )

    session.close()

    return results


async def get_filters():
    cache_key = MANGA_CACHE_KEYS['filters']
    result = await RD.get( cache_key )

    if not result:

        session = DB()

        authors_query =\
            select(
                models.Author
            )\
            .join(
                models.AuthorsToRanobe, models.AuthorsToRanobe.c.author_id==models.Author.id
            )\
            .group_by(
                models.AuthorsToRanobe.c.author_id
            )\
            .order_by(
                models.Author.name.asc()
            )

        genres_query =\
            select(
                models.Genre
            )\
            .join(
                models.GenresToRanobe, models.GenresToRanobe.c.genre_id==models.Genre.id
            )\
            .group_by(
                models.GenresToRanobe.c.genre_id
            )\
            .order_by(
                models.Genre.name.asc()
            )

        authors = session.execute( authors_query ).scalars().all()
        genres = session.execute( genres_query ).scalars().all()

        filters = {
            'authors': [ schemas.ShortData.model_validate( author ).model_dump() for author in authors ],
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
) -> List[ schemas.Ranobe ]:

    session = DB()

    ranobes_query = select( models.Ranobe )

    if 'genres' in filters:
        ranobes_query = ranobes_query\
            .join(
                models.GenresToRanobe,
                models.GenresToRanobe.c.ranobe_id==models.Ranobe.id
            )\
            .filter(
                models.GenresToRanobe.c.genre_id.in_( map( int, filters['genres'] ) )
            )

    if 'authors' in filters:
        ranobes_query = ranobes_query\
            .join(
                models.AuthorsToRanobe,
                models.AuthorsToRanobe.c.ranobe_id==models.Ranobe.id
            )\
            .filter(
                models.AuthorsToRanobe.c.author_id.in_( map( int, filters['authors'] ) )
            )

    if 'search' in filters:
        terms = str( filters[ 'search' ] ).split(' ')

        cases = []
        for term in terms:
            cases.append(
                case(
                    (
                        or_(
                            models.Ranobe.name.ilike(f'%{term}%'),
                            models.Ranobe.eng_name.ilike(f'%{term}%')
                        ),
                        1
                    ),
                    else_=0
                )
            )

        cases_j = cases.pop(0)
        for _case in cases:
            cases_j = cases_j + _case
        
        ranobes_query = ranobes_query\
            .add_columns(
                func.sum( cases_j ).label('relevance')
            )\
            .having(
                text("relevance > 0")
            )\
            .order_by(
                desc("relevance")
            )

    ranobes_query = ranobes_query\
        .offset(
            offset
        )\
        .limit(
            limit
        )\
        .group_by(
            models.Ranobe.id
        )\
        .order_by(
            models.Ranobe.name.asc()
        )

    ranobes = session.execute( ranobes_query ).scalars().all()

    result = orjson.dumps([ schemas.Ranobe.model_validate( ranobe ).model_dump() for ranobe in ranobes ])

    session.close()

    return result


async def get_single(
    ranobe_slug: str
) -> str:

    cache_key = MANGA_CACHE_KEYS['single'].format( ranobe_slug )
    result = await RD.get( cache_key )

    if not result:

        session = DB()

        ranobe = session.execute( 
            select(
                models.Ranobe
            )\
            .where(
                models.Ranobe.slug==ranobe_slug
            )
        ).scalars().one_or_none()

        if ranobe:
            result = schemas.RanobeFull.model_validate( ranobe ).model_dump_json()
            await RD.set( cache_key, result, 3600 )
        else:
            result = '{}'

        session.close()

    return result


async def get_reader(
    ranobe_slug: str
) -> str:

    cache_key = MANGA_CACHE_KEYS['reader'].format(ranobe_slug)
    result = await RD.get( cache_key )

    if not result:
        # print(f'ranobe {ranobe_slug} reader not cached')

        session = DB()

        ranobe = session.execute( 
            select(
                models.Ranobe
            )\
            .where(
                models.Ranobe.slug==ranobe_slug
            )
        ).scalars().one_or_none()

        result = '{}'

        if ranobe:
            _ranobe = schemas.RanobeReader.model_validate( ranobe )

            chapters_query = session.execute( 
                select(
                    models.RanobeChapter
                )\
                .join(
                    models.RanobeVolume,
                    models.RanobeVolume.id==models.RanobeChapter.volume_id
                )\
                .where(
                    models.RanobeVolume.ranobe_id==ranobe.id
                )\
                .order_by(
                    models.RanobeVolume.number.asc(),
                    models.RanobeChapter.number.asc()
                )
            )
            chapters = chapters_query.scalars().all()

            if chapters:
                _ranobe.chapters = [ schemas.RanobeReaderChapter.model_validate( chapter ) for chapter in chapters ]

            result = _ranobe.model_dump_json()
            await RD.set( cache_key, result, 3600 )
        else:
            result = '{}'

        session.close()

    return result