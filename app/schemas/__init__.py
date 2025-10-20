from __future__ import annotations

from pydantic import BaseModel, Field, computed_field
from datetime import date, datetime
from typing import List, Any, Union

from .anime import *
from .manga import *
from .ranobe import *
from .core import *

class Notification(BaseModel):
    id: int = 0
    type: str = Field(validation_alias='target')
    message: str = ""
    datetime_date: str = ""
    datetime_time: str = ""
    cover: str = ""
    routine: List[ str ] = []
    objects: dict[ str, NotificationElement ] = {}

    class Config:
        from_attributes = True

class NotificationElement(BaseModel):
    id: int
    slug: str = ""
    name: str = ""
    eng_name: str = ""
    raw_cover: Cover|None = Field(validation_alias='cover',exclude=True)

    # @computed_field
    # def cover(self) -> str:
    #     if self.raw_cover:
    #         return self.raw_cover.mini
    #     return ""

    class Config:
        from_attributes = True