import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import ORJSONResponse
from app.dependencies import PJSONResponse
from app.crud.anime import *
from app.tools import parse_query
from app.scaners.anime import scan_animes, scan_animes_single

anime = FastAPI()


@anime.get( '/rescan' )
def endpoint_rescan():
    scan_animes()
    return None


@anime.get( '/rescan/{name}' )
def endpoint_rescan_single( name: str ):
    scan_animes_single( name )
    return None


#


@anime.get( '/filters' )
async def endpoint_filters():
    filters = await get_filters()
    return PJSONResponse( filters )


@anime.get( '/list' )
async def endpoint_list( request: Request, offset: int = 0, limit: int = 50 ):
    filters = parse_query( request.query_params )
    del filters['offset']
    del filters['limit']
    animes = await get_list( offset, limit, filters )
    return PJSONResponse( animes )


@anime.get( '/{anime_slug}' )
async def endpoint_single( anime_slug: str ):
    anime = await get_single( anime_slug )
    return PJSONResponse( anime )


@anime.get( '/{anime_slug}/{season_slug}' )
async def endpoint_season( anime_slug: str, season_slug: str ):
    season = await get_season( anime_slug, season_slug )
    return PJSONResponse( season )