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

class RanobeBase( BaseModel ):
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
    meta: Dict[ str, Any ] = {}

    class Config:
        from_attributes = True


class RanobeFull(RanobeBase):
    ext: str = ""
    foldersize: int = 0
    timestamp: int = 0
    volumes: List[ RanobeFullVolume ] = []

    class Config:
        from_attributes = True


class RanobeFullVolume( BaseModel ):
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
    # 
    chapters: List[ RanobeChapter ] = []

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
    # 
    navigation: List[ RanobeReaderNavigationElement ] = []

    class Config:
        from_attributes = True


class RanobeReaderNavigationElement( BaseModel ):
    id: int
    number: float = 1
    volume_number: float
    name: str = ""
    eng_name: str = ""

    class Config:
        from_attributes = True

class RanobeReaderChapterContent( BaseModel ):
    id: int
    number: float = 1
    volume_number: float = 1
    name: str = ""
    eng_name: str = ""
    content: object
    timestamp: int = 0

    class Config:
        from_attributes = True