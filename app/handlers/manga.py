import asyncio
from fastapi import FastAPI, Request
from app.dependencies import PJSONResponse
from app.crud.manga import *
from app.tools import parse_query
from app.scaners.manga import scan_mangas, scan_mangas_single

manga = FastAPI()


@manga.get( '/rescan' )
def endpoint_rescan():
    scan_mangas()
    return None


@manga.get( '/rescan/{name}' )
def endpoint_rescan_single( name: str ):
    scan_mangas_single( name )
    return None


@manga.get( '/filters' )
async def endpoint_filters():
    filters = await get_filters()
    return PJSONResponse( filters )


@manga.get( '/list' )
async def endpoint_list( request: Request, offset: int = 0, limit: int = 50 ):
    filters = parse_query( request.query_params )
    del filters['offset']
    del filters['limit']
    mangas = await get_list( offset, limit, filters )
    return PJSONResponse( mangas )


@manga.get( '/{manga_slug}' )
async def endpoint_single( manga_slug: str ):
    response = await get_single( manga_slug )
    return PJSONResponse( response )


@manga.get( '/{manga_slug}/reader' )
async def endpoint_reader( manga_slug: str ):
    response = await get_reader( manga_slug )
    return PJSONResponse( response )