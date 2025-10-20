from __future__ import annotations

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import List, Dict, Any, Union, Optional

from .core import *

class RanobeMeta( BaseModel ):
    key: str = Field( validation_alias='meta_key' )
    value: str = Field( validation_alias='meta_value' )

    class Config:
        from_attributes = True

class Ranobe( BaseModel ):
    id: int
    #
    name: str = ""
    eng_name: str = ""
    slug: str = ""
    status: str = ""
    #
    authors: List[ Author ] = []
    genres: List[ Genre ] = []
    translators: List[ Translator ] = []
    #
    mature: bool = False
    #
    cover: Cover | None
    covers: List[ Cover ] = Field( validation_alias='all_covers' )
    #
    # volumes_count: int = 0
    #
    ext: str = ""
    foldersize: int = 0
    meta: Dict[ str, Any ] = {}
    timestamp: int = 0

    class Config:
        from_attributes = True


class RanobeVolume( BaseModel ):
    id: int
    ranobe_id: int
    #
    number: float = 1
    name: str = ""
    eng_name: str = ""
    slug: str = ""
    status: str = ""
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


class RanobeChapter( BaseModel ):
    id: int
    volume_id: int
    volume_number: float
    #
    number: float = 1
    name: str = ""
    eng_name: str = ""

    ext: str = ""
    filesize: int = 0
    download_path: str = ""

    class Config:
        from_attributes = True


#

class RanobeReader( BaseModel ):
    id: int
    name: str = ""
    eng_name: str = ""
    slug: str = ""
    timestamp: int = 0
    chapters: List[ RanobeReaderChapter ] = []

    class Config:
        from_attributes = True


class RanobeReaderChapter( BaseModel ):
    number: float = 1
    volume_number: float
    # 
    filesize: int = 0
    download_path: str = ""

    class Config:
        from_attributes = True
#


class RanobeFull(Ranobe):
    volumes: List[ RanobeVolumeFull ] = []

    class Config:
        from_attributes = True


class RanobeVolumeFull(RanobeVolume):
    chapters: List[ RanobeChapter ] = []

    class Config:
        from_attributes = True