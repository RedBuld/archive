import asyncio
from fastapi import FastAPI, Request
from app.dependencies import PJSONResponse
from app.crud.notifications import *

notifications = FastAPI()


@notifications.get('/list')
async def endpoint_notifications(
    limit: int = 10,
    offset: int = 0
):
    notifications = await get_notifications( limit, offset )
    return PJSONResponse( notifications )


@notifications.get('/last')
async def endpoint_last_notifications():
    response = await get_last_notifications()
    return PJSONResponse( response )