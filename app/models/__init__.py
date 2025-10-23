from __future__ import annotations

import os
from typing import List
from datetime import date, datetime
from email.policy import default
from sqlalchemy import func, select, exists, or_, and_
from sqlalchemy import SmallInteger, Column, Integer, Float, String, Text, Date, DateTime, Computed, JSON, UniqueConstraint, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped
from app.db import DB
from app.db import Base

from .user import *
from .teams import *
# from .anime import *
from .manga import *
from .ranobe import *


class Option(Base):
    __tablename__ = "options"

    id: Mapped[int]                               = Column("id", Integer, primary_key=True)
    name: Mapped[str]                             = Column("name", String(40), index=True)
    value: Mapped[str]                            = Column("value", Text)


# class Notification(Base):
#     __tablename__ = "notifications"

#     id: Mapped[int]                               = Column("id", Integer, primary_key=True)
#     _datetime: Mapped[datetime]                   = Column("datetime", DateTime, default=datetime.now)
#     action: Mapped[str]                           = Column("action", Text)
#     target: Mapped[str]                           = Column("target", Text)
#     target_id: Mapped[int]                        = Column("target_id", Integer)

#     def __repr__( self ):
#         return str({
#             'id': self.id,
#             'target': self.target,
#             'target_id': self.target_id,
#             'routine': self.routine,
#             'cover': self.cover,
#             'objects': self.objects,
#         })

#     @property
#     def datetime_date(self) -> str | None:
#         return self._datetime.strftime('%d.%m.%Y') if self._datetime else ''
    
#     @property
#     def datetime_time(self) -> str | None:
#         return self._datetime.strftime('%H:%M:%S') if self._datetime else ''

#     @property
#     def message(self) -> str:
#         result = ''
#         if self.action == 'new':
#             result = 'Добавление'
#         elif self.action == 'update':
#             result = 'Обновление'
#         elif self.action == 'convert':
#             result = 'Реконвертация'
        
#         if self.target == 'Anime':
#             result += ' аниме'
#         elif self.target == 'AnimeSeason':
#             result += ' сезона аниме'
#         elif self.target == 'AnimeSeria':
#             result += ' серии аниме'
#         elif self.target == 'Manga':
#             result += ' манги'
#         elif self.target == 'MangaVolume':
#             result += ' тома манги'
#         elif self.target == 'MangaChapter':
#             result += ' главы манги'

#         return result

#     @property
#     def routine(self) -> List[ str ]:
#         routine = []
#         if self.target == 'Anime':
#             routine = ['Anime']
#         elif self.target == 'AnimeSeason':
#             routine = ['AnimeSeason','Anime']
#         # elif self.target == 'AnimeSeria':
#         #     routine = ['AnimeSeria','AnimeSeason','Anime']
#         elif self.target == 'Manga':
#             routine = ['Manga']
#         elif self.target == 'MangaVolume':
#             routine = ['MangaVolume','Manga']
#         # elif self.target == 'MangaChapter':
#         #     routine = ['MangaChapter','MangaVolume','Manga']
#         return routine

#     @property
#     def cover(self) -> str:
#         cover = ''
#         objects = self.objects
#         routine = self.routine
#         for key in routine:
#             if key in objects and objects[key]:
#                 if objects[key].raw_cover:
#                     cover = objects[key].raw_cover.mini
#                     break
#         return cover

#     @property
#     def objects(self) -> dict:
#         from app.schemas import NotificationElement

#         result = {}

#         query = None

#         if self.target == 'Anime':
#             query = select(Anime).where(Anime.id==self.target_id)
#         elif self.target == 'AnimeSeason':
#             query = select(AnimeSeason).where(AnimeSeason.id==self.target_id)
#         # elif self.target == 'AnimeSeria':
#         #     query = select(AnimeSeria).where(AnimeSeria.id==self.target_id)
#         elif self.target == 'Manga':
#             query = select(Manga).where(Manga.id==self.target_id)
#         elif self.target == 'MangaVolume':
#             query = select(MangaVolume).where(MangaVolume.id==self.target_id)
#         # elif self.target == 'MangaChapter':
#         #     query = select(MangaChapter).where(MangaChapter.id==self.target_id)

#         if query is not None:
#             session = DB()

#             object_query = session.execute(query)
#             raw_element = object_query.scalar_one_or_none()

#             if raw_element:
                
#                 if self.target == 'Anime':
#                     element: Anime = raw_element
#                     result['Anime'] = NotificationElement.model_validate(element)

#                 elif self.target == 'AnimeSeason':
#                     element: AnimeSeason = raw_element
#                     result['Anime'] = NotificationElement.model_validate(element.anime)
#                     result['AnimeSeason'] = NotificationElement.model_validate(element)

#                 # elif self.target == 'AnimeSeria':
#                 #     element: AnimeSeria = raw_element
#                 #     result['Anime'] = NotificationElement.model_validate(element.season.anime)
#                 #     result['AnimeSeason'] = NotificationElement.model_validate(element.season)
#                 #     result['AnimeSeria'] = NotificationElement.model_validate(element)

#                 elif self.target == 'Manga':
#                     element: Manga = raw_element
#                     result['Manga'] = NotificationElement.model_validate(element)

#                 elif self.target == 'MangaVolume':
#                     element: MangaVolume = raw_element
#                     result['Manga'] = NotificationElement.model_validate(element.manga)
#                     result['MangaVolume'] = NotificationElement.model_validate(element)

#                 # elif self.target == 'MangaChapter':
#                 #     element: MangaChapter = raw_element
#                 #     result['Manga'] = NotificationElement.model_validate(element.volume.manga)
#                 #     result['MangaVolume'] = NotificationElement.model_validate(element.volume)
#                 #     result['MangaChapter'] = NotificationElement.model_validate(element)

#             session.close()

#         return result



