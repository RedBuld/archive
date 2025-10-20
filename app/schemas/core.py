from __future__ import annotations

from pydantic import BaseModel, Field, computed_field
from datetime import date, datetime
from typing import List, Dict, Any, Union

class ShortData(BaseModel):
    id: int
    name: str = ""

    class Config:
        from_attributes = True


class Author(ShortData):
    pass

class Genre(ShortData):
    pass

class Studio(ShortData):
    pass

class Voice(ShortData):
    pass

class Translator(ShortData):
    pass

class Cover(BaseModel):
    full: str = Field(validation_alias='cover_link_full')
    mini: str = Field(validation_alias='cover_link_mini')

    class Config:
        from_attributes = True

class SearchResponse(BaseModel):
    anime: List[ SearchResult ] = []
    manga: List[ SearchResult ] = []
    found: int = 0

class SearchResult(BaseModel):
    name: str = ""
    eng_name: str = ""
    slug: str = ""
    type: str = ""
    cover: str = ""

    class Config:
        from_attributes = True