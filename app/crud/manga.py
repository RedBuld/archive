import orjson
from sqlalchemy import select, func, or_, and_, case, asc, desc, text
from typing import Dict, List, Any
from app import models
from app import schemas
from app.db import DB
from app.db import RD
from app.tools import calculate_hash


MANGA_CACHE_KEYS = {
    'list': 'manga-list',
    'filters': 'manga-filters',
    'single': 'manga-{}',
    'reader': 'manga-{}-reader',
}


async def search(
    search: str
) -> List[ schemas.SearchResult ]:

    results = []

    terms = search.split(' ')

    session = DB()

    # 
    
    manga_cases = []
    for term in terms:
        manga_cases.append(
            case(
                (
                    or_(
                        models.Manga.name.ilike(f'%{term}%'),
                        models.Manga.eng_name.ilike(f'%{term}%')
                    ),
                    1
                ),
                else_=0
            )
        )
    
    # 
    
    manga_cases_j = manga_cases.pop(0)
    for _case in manga_cases:
        manga_cases_j = manga_cases_j + _case

    # 
    
    manga_query =\
        select(
            models.Manga,
            func.sum( manga_cases_j ).label('relevance')
        )\
        .having(
            text("relevance > 0")
        )\
        .group_by(
            models.Manga.id
        )\
        .order_by(
            desc("relevance")
        )

    # print('#'*20)
    # print( manga_query.compile(compile_kwargs={"literal_binds": True}) )
    # print('#'*20)

    mangas: List[ models.Manga ] = session.execute( manga_query ).scalars().all()

    if len( mangas ) > 0:
        for manga in mangas:
            result = schemas.SearchResult()
            result.type = 'manga'
            result.name = manga.name
            result.eng_name = manga.eng_name
            result.slug = manga.slug
            if manga.cover:
                result.cover = manga.cover.cover_link_mini if manga.cover.cover_link_mini != '' else manga.cover.cover_link_full
            elif manga.all_covers:
                result.cover = manga.all_covers[0].cover_link_mini if manga.all_covers[0].cover_link_mini != '' else manga.all_covers[0].cover_link_full
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
                models.AuthorsToManga, models.AuthorsToManga.c.author_id==models.Author.id
            )\
            .group_by(
                models.AuthorsToManga.c.author_id
            )\
            .order_by(
                models.Author.name.asc()
            )

        genres_query =\
            select(
                models.Genre
            )\
            .join(
                models.GenresToManga, models.GenresToManga.c.genre_id==models.Genre.id
            )\
            .group_by(
                models.GenresToManga.c.genre_id
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
) -> List[ schemas.Manga ]:

    session = DB()

    mangas_query = select( models.Manga )

    if 'genres' in filters:
        mangas_query = mangas_query\
            .join(
                models.GenresToManga,
                models.GenresToManga.c.manga_id==models.Manga.id
            )\
            .filter(
                models.GenresToManga.c.genre_id.in_( map( int, filters['genres'] ) )
            )

    if 'authors' in filters:
        mangas_query = mangas_query\
            .join(
                models.AuthorsToManga,
                models.AuthorsToManga.c.manga_id==models.Manga.id
            )\
            .filter(
                models.AuthorsToManga.c.author_id.in_( map( int, filters['authors'] ) )
            )

    if 'search' in filters:
        terms = str( filters[ 'search' ] ).split(' ')

        cases = []
        for term in terms:
            cases.append(
                case(
                    (
                        or_(
                            models.Manga.name.ilike(f'%{term}%'),
                            models.Manga.eng_name.ilike(f'%{term}%')
                        ),
                        1
                    ),
                    else_=0
                )
            )

        cases_j = cases.pop(0)
        for _case in cases:
            cases_j = cases_j + _case
        
        mangas_query = mangas_query\
            .add_columns(
                func.sum( cases_j ).label('relevance')
            )\
            .having(
                text("relevance > 0")
            )\
            .order_by(
                desc("relevance")
            )

    mangas_query = mangas_query\
        .offset(
            offset
        )\
        .limit(
            limit
        )\
        .group_by(
            models.Manga.id
        )\
        .order_by(
            models.Manga.name.asc()
        )

    mangas = session.execute( mangas_query ).scalars().all()

    result = orjson.dumps([ schemas.Manga.model_validate( manga ).model_dump() for manga in mangas ])

    session.close()

    return result


async def get_single(
    manga_slug: str
) -> str:

    cache_key = MANGA_CACHE_KEYS['single'].format( manga_slug )
    result = await RD.get( cache_key )

    if not result:

        session = DB()

        manga = session.execute( 
            select(
                models.Manga
            )\
            .where(
                models.Manga.slug==manga_slug
            )
        ).scalars().one_or_none()

        if manga:
            result = schemas.MangaFull.model_validate( manga ).model_dump_json()
            await RD.set( cache_key, result, 3600 )
        else:
            result = '{}'

        session.close()

    return result


async def get_reader(
    manga_slug: str
) -> str:

    cache_key = MANGA_CACHE_KEYS['reader'].format(manga_slug)
    result = await RD.get( cache_key )

    if not result:
        # print(f'manga {manga_slug} reader not cached')

        session = DB()

        manga = session.execute( 
            select(
                models.Manga
            )\
            .where(
                models.Manga.slug==manga_slug
            )
        ).scalars().one_or_none()

        result = '{}'

        if manga:
            _manga = schemas.MangaReader.model_validate( manga )

            chapters_query = session.execute( 
                select(
                    models.MangaChapter
                )\
                .join(
                    models.MangaVolume,
                    models.MangaVolume.id==models.MangaChapter.volume_id
                )\
                .where(
                    models.MangaVolume.manga_id==manga.id
                )\
                .order_by(
                    models.MangaVolume.number.asc(),
                    models.MangaChapter.number.asc()
                )
            )
            chapters = chapters_query.scalars().all()

            if chapters:
                _manga.chapters = [ schemas.MangaReaderChapter.model_validate( chapter ) for chapter in chapters ]

            result = _manga.model_dump_json()
            await RD.set( cache_key, result, 3600 )
        else:
            result = '{}'

        session.close()

    return result