import asyncio
from fastapi import FastAPI, Request
from app.dependencies import PJSONResponse
from app.crud.ranobe import *
from app.tools import parse_query
# from app.scaners.ranobe import scan_ranobes, scan_ranobes_single

ranobe = FastAPI()


@ranobe.get( '/rescan' )
async def endpoint_rescan():
    # asyncio.create_task( scan_ranobes() )
    return None


@ranobe.get( '/rescan/{name}' )
async def endpoint_rescan_single( name: str ):
    # asyncio.create_task( scan_ranobes_single( name ) )
    return None


@ranobe.get( '/filters' )
async def endpoint_filters():
    filters = await get_filters()
    return PJSONResponse( filters )


@ranobe.get( '/list' )
async def endpoint_list( request: Request, offset: int = 0, limit: int = 50 ):
    filters = parse_query( request.query_params )
    del filters['offset']
    del filters['limit']
    ranobes = await get_list( offset, limit, filters )
    return PJSONResponse( ranobes )


@ranobe.get( '/{ranobe_slug}' )
async def endpoint_single( ranobe_slug: str ):
    response = await get_single( ranobe_slug )
    return PJSONResponse( response )


@ranobe.get( '/{ranobe_slug}/reader' )
async def endpoint_reader( ranobe_slug: str ):
    response = await get_reader( ranobe_slug )
    return PJSONResponse( response )