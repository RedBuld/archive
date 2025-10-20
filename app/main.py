import os
import sys
import ujson
import asyncio
import shutil

from contextlib import asynccontextmanager
from typing import Dict, List
from fastapi import FastAPI, Request
from fastapi.responses import Response, HTMLResponse, ORJSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.exceptions import ResponseValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, select, exists, or_, and_
from starlette.staticfiles import StaticFiles
# from fastapi_jwt_auth import AuthJWT
# from fastapi_jwt_auth.exceptions import AuthJWTException
# from fastapi_cache import FastAPICache
# from fastapi_cache.backends.redis import RedisBackend
# from fastapi_cache.decorator import cache
# from redis import asyncio as aioredis
# from app import schemas
# from app.routers import BorrowesRequests
# from app.routers import BondsRequests
# from app.routers import FoldersRequests
# from app.routers import UpdatesRequests
# from app.routers import ChatsRequests
# from app.routers import AuthRequests
# from app.routers import MiscRequests
from app.dependencies import PJSONResponse
from app.dependencies import update_db
from app.db import DB, RD
from app import schemas

# @AuthJWT.load_config
# def get_config():
#     return schemas.JWTSettings()

# async def authjwt_exception_handler(request: Request, exc: AuthJWTException):
#     return ORJSONResponse(
#         status_code=401,
#         content={"detail": str(exc) }
#     )

async def request_validation_error_exception_handler(request: Request, exc: RequestValidationError):
    print(exc)
    validation_errors = exc.errors()
    return ORJSONResponse(
        status_code=500,
        content={"detail": [str(err) for err in validation_errors]}
    )

async def response_validation_error_exception_handler(request: Request, exc: ResponseValidationError):
    print(exc)
    validation_errors = exc.errors()
    return ORJSONResponse(
        status_code=500,
        content={"detail": [str(err) for err in validation_errors]}
    )

async def base_error_exception_handler(request: Request, exc: Exception):
    print(exc)
    return ORJSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

@asynccontextmanager
async def lifespan( app: FastAPI ):
    update_db()
    # await scan_mangas()
    # sys.exit(0)
    # await rebuild_mangas_cache()
    # await rebuild_animes_cache()
    # sys.exit(0)
    # await reset_notifications()
    # await reset_animes()
    # await reset_mangas()
    yield
    if RD is not None:
        await RD.close()

# platform_dependent = 'public' if os.name == 'nt' else ''
base_folder = os.path.dirname(__file__)


app_dir = os.path.join(base_folder,'web')
static_dir = os.path.join(base_folder,'web/assets')
distant_dir = os.path.join(base_folder,'web_prebuilded')
covers_dir = os.path.join(base_folder,'web/covers')
download_dir = os.path.join(base_folder,'web/download')

if not os.name == 'nt':
    os.system(f"rm -rf {app_dir}/assets")
    os.system(f"rm -rf {app_dir}/fonts")
    os.system(f"rm -rf {app_dir}/index.html")
    os.system(f"cp -Rf {distant_dir}/* {app_dir}")

app = FastAPI(
    exception_handlers={
        # AuthJWTException: authjwt_exception_handler,
        RequestValidationError: request_validation_error_exception_handler,
        ResponseValidationError: response_validation_error_exception_handler,
        Exception: base_error_exception_handler
    },
    lifespan=lifespan
)
app.mount("/assets", StaticFiles(directory=static_dir), name="assets")
app.mount("/covers", StaticFiles(directory=covers_dir), name="covers")
app.mount("/download", StaticFiles(directory=download_dir), name="download")

# @app.on_event("startup")
# async def startup():
#     redis = aioredis.from_url("redis://localhost",  db=12)
#     FastAPICache.init(RedisBackend(redis), prefix="papers-cache")

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.handlers.anime import anime
from app.handlers.manga import manga
from app.handlers.ranobe import ranobe
from app.handlers.mediainfo import mediainfo
from app.handlers.notifications import notifications

app.mount( '/api/anime', anime )
app.mount( '/api/manga', manga )
app.mount( '/api/ranobe', ranobe )
app.mount( '/api/mediainfo', mediainfo )
app.mount( '/api/notifications', notifications )


@app.get('/api/disk_stats')
async def endpoint_disk_stats():
    from app.crud import get_disk_stats
    response = await get_disk_stats()
    return Response(content=response, media_type="application/json")


@app.post('/api/search', response_model=schemas.SearchResponse)
async def endpoint_search(request: Request):

    from app.crud.manga import search as search_manga
    from app.crud.anime import search as search_anime
    from app.crud.ranobe import search as search_ranobe

    payload = await request.json()

    result = {
        "anime": [],
        "manga": [],
        "ranobe": [],
        "found": 0
    }

    if 'search' in payload and payload['search']:
        anime, manga, ranobe = await asyncio.gather(
            search_anime( payload['search'] ),
            search_manga( payload['search'] ),
            search_ranobe( payload['search'] )
        )

        result["anime"] = anime
        result["manga"] = manga
        result["ranobe"] = ranobe
        result["found"] = len( anime ) + len( manga ) + len( ranobe )

    return ORJSONResponse( result )


# SPA

@app.get('/favicon.ico')
def favicon():
    return None

@app.get('/{rest_of_path:path}')
def index(rest_of_path: str):
    data = ''
    try:
        with open(os.path.join(app_dir, 'index.html')) as fh:
            data = fh.read()
    except:
        pass
    return HTMLResponse(content=data)