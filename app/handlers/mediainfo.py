import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import ORJSONResponse
from app.dependencies import PJSONResponse
from app.crud.anime import *
from app.tools import parse_query
from app.scaners.anime import scan_animes, scan_animes_single

mediainfo = FastAPI()


@mediainfo.get( '/anime/{anime_id}' )
async def endpoint_mediainfo_anime( anime_id: float ):
    from app.scaners.tools import get_mediainfo
    info = await get_mediainfo( 'anime', anime_id )
    return ORJSONResponse( info )


@mediainfo.get( '/season/{season_id}' )
async def endpoint_mediainfo_season( season_id: float ):
    from app.scaners.tools import get_mediainfo
    info = await get_mediainfo( 'season', season_id )
    return ORJSONResponse( info )


@mediainfo.get( '/chapter/{chapter_id}' )
async def endpoint_mediainfo_chapter( chapter_id: float ):
    from app.scaners.tools import get_mediainfo
    info = await get_mediainfo( 'seria', chapter_id )
    return ORJSONResponse( info )