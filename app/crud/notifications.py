import orjson
from typing import List
from sqlalchemy import select, and_, or_

from app import models
from app import schemas
from app.db import DB
from app.db import RD

async def reset_notifications() -> None:
    await RD.delete('last_notifications')
    await get_last_notifications()


async def get_last_notifications() -> str:

    notifications = await RD.get('last_notifications')

    if not notifications:
        notifications = await get_notifications( 10, 0 )
        await RD.set( 'last_notifications', notifications )

    return notifications


async def get_notifications(
    limit: int = 0,
    offset: int = 0
) -> str:

    session = DB()

    notifications_query = \
        select(
            models.Notification,
        )\
        .join(
            models.Anime,
            and_(
                models.Notification.target=='Anime',
                models.Anime.id==models.Notification.target_id
            ),
            isouter=True
        )\
        .join(
            models.AnimeSeason,
            and_(
                models.Notification.target=='AnimeSeason',
                models.AnimeSeason.id==models.Notification.target_id
            ),
            isouter=True
        )\
        .join(
            models.Manga,
            and_(
                models.Notification.target=='Manga',
                models.Manga.id==models.Notification.target_id
            ),
            isouter=True
        )\
        .join(
            models.MangaVolume,
            and_(
                models.Notification.target=='MangaVolume',
                models.MangaVolume.id==models.Notification.target_id
            ),
            isouter=True
        )\
        .filter(
            or_(
                models.Anime.id!=None,
                models.AnimeSeason.id!=None,
                models.Manga.id!=None,
                models.MangaVolume.id!=None
            )
        )\
        .offset(
            offset
        )\
        .limit(
            limit
        )\
        .order_by(
            models.Notification.id.desc()
        )

    notifications = session.execute( notifications_query ).scalars().all()

    result = [ schemas.Notification.model_validate( notification ).model_dump_json() for notification in notifications ]
    result = f'[{",".join(result)}]'

    session.close()

    return result