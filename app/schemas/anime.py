from __future__ import annotations

from pydantic import BaseModel, Field, computed_field
from datetime import date, datetime
from typing import List, Dict, Any, Union

from .core import *

class AnimeMeta( BaseModel ):
    key: str = Field( validation_alias='meta_key' )
    value: str = Field( validation_alias='meta_value' )

    class Config:
        from_attributes = True

class Anime( BaseModel ):
    id: int
    #
    name: str = ""
    eng_name: str = ""
    slug: str = ""
    status: str = ""
    #
    studios: List[ Studio ] = []
    genres: List[ Genre ] = []
    voices: List[ Voice ] = []
    #
    mature: bool = False
    #
    cover: Cover | None
    covers: List[ Cover ] = Field( validation_alias='all_covers' )
    #
    ext: str = ""
    filesize: int = 0
    foldersize: int = 0
    download_path: str = ""
    meta: Dict[ str, Any ] = {}
    mono: bool = False
    timestamp: int = 0

    class Config:
        from_attributes = True


class AnimeSeason( BaseModel ):
    id: int
    #
    number: float = 1
    name: str = ""
    eng_name: str = ""
    slug: str = ""
    # 
    studios: List[ Studio ] = []
    genres: List[ Genre ] = []
    voices: List[ Voice ] = []
    #
    cover: Cover | None
    #
    ext: str = ""
    filesize: int = 0
    foldersize: int = 0
    download_path: str = ""
    meta: Dict[ str, Any ] = {}

    class Config:
        from_attributes = True


class AnimeSeria( BaseModel ):
    id: int
    #
    number: float = 1
    name: str = ""
    eng_name: str = ""

    ext: str = ""
    filesize: int = 0
    download_path: str = ""
    meta: Dict[ str, Any ] = {}

    class Config:
        from_attributes = True


#


class AnimeFull(Anime):
    seasons: List[ AnimeSeasonFull ] = []

    class Config:
        from_attributes = True


class AnimeSeasonFull(AnimeSeason):
    series: List[ AnimeSeria ] = []

    class Config:
        from_attributes = True

class AnimeSeasonSingle(AnimeSeason):
    anime: Anime
    series: List[ AnimeSeria ] = []

    class Config:
        from_attributes = True