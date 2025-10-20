from __future__ import annotations

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import List, Dict, Any, Union, Optional

from .core import *

class MangaMeta( BaseModel ):
    key: str = Field( validation_alias='meta_key' )
    value: str = Field( validation_alias='meta_value' )

    class Config:
        from_attributes = True

class Manga( BaseModel ):
    id: int
    #
    name: str = ""
    eng_name: str = ""
    slug: str = ""
    status: str = ""
    #
    authors: List[ Author ] = []
    genres: List[ Genre ] = []
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


class MangaVolume( BaseModel ):
    id: int
    manga_id: int
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


class MangaChapter( BaseModel ):
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

class MangaReader( BaseModel ):
    id: int
    name: str = ""
    eng_name: str = ""
    slug: str = ""
    timestamp: int = 0
    chapters: List[ MangaReaderChapter ] = []

    class Config:
        from_attributes = True


class MangaReaderChapter( BaseModel ):
    number: float = 1
    volume_number: float
    # 
    filesize: int = 0
    download_path: str = ""

    class Config:
        from_attributes = True
#


class MangaFull(Manga):
    volumes: List[ MangaVolumeFull ] = []

    class Config:
        from_attributes = True


class MangaVolumeFull(MangaVolume):
    chapters: List[ MangaChapter ] = []

    class Config:
        from_attributes = True