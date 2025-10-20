from __future__ import annotations

import os
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy import Table, Column
from sqlalchemy import SmallInteger, Integer, Float, String, Text, Boolean, Date, DateTime, Computed, JSON, UniqueConstraint, ForeignKey, Index
from sqlalchemy.dialects.mysql import TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped
from app.db import DB
from app.db import Base
from .core import *

#


StudiosToAnime = Table(
    "r_studios_to_anime",
    Base.metadata,
    Column(
        "anime_id",
        Integer,
        ForeignKey('anime.id', ondelete="cascade"),
        nullable=True,
        default=None,
        index=True
    ),
    Column(
        "season_id",
        Integer,
        ForeignKey('anime_season.id', ondelete="cascade"),
        nullable=True,
        default=None,
        index=True
    ),
    Column(
        "studio_id",
        Integer,
        ForeignKey( "general_studios.id", ondelete="cascade" ),
    )
)


GenresToAnime = Table(
    "r_genres_to_anime",
    Base.metadata,
    Column(
        "anime_id",
        Integer,
        ForeignKey('anime.id', ondelete="cascade"),
        nullable=True,
        default=None,
        index=True
    ),
    Column(
        "season_id",
        Integer,
        ForeignKey('anime_season.id', ondelete="cascade"),
        nullable=True,
        default=None,
        index=True
    ),
    Column(
        "genre_id",
        Integer,
        ForeignKey( "general_genres.id", ondelete="cascade" ),
    )
)


VoicesToAnime = Table(
    "r_voices_to_anime",
    Base.metadata,
    Column(
        "anime_id",
        Integer,
        ForeignKey('anime.id', ondelete="cascade"),
        nullable=True,
        default=None,
        index=True
    ),
    Column(
        "season_id",
        Integer,
        ForeignKey('anime_season.id', ondelete="cascade"),
        nullable=True,
        default=None,
        index=True
    ),
    Column(
        "voice_id",
        Integer,
        ForeignKey( "general_voices.id", ondelete="cascade" ),
    )
)


#





class AnimeMeta(Base):
    __tablename__ = "anime_meta"

    id: Mapped[ int ]         = Column(
        "id",
        Integer,
        primary_key=True
    )
    anime_id: Mapped[ int ]   = Column(
        "anime_id",
        Integer,
        index=True
    )
    meta_key: Mapped[ str ]   = Column(
        "meta_key",
        String(20),
        default=""
    )
    meta_value: Mapped[ str ] = Column(
        "meta_value",
        Text,
        default=""
    )


class AnimeSeasonMeta(Base):
    __tablename__ = "anime_season_meta"

    id: Mapped[ int ]         = Column(
        "id",
        Integer,
        primary_key=True
    )
    season_id: Mapped[ int ]  = Column(
        "season_id",
        Integer,
        index=True
    )
    meta_key: Mapped[ str ]   = Column(
        "meta_key",
        String(20),
        default=""
    )
    meta_value: Mapped[ str ] = Column(
        "meta_value",
        Text,
        default=""
    )


class AnimeSeriaMeta(Base):
    __tablename__ = "anime_seria_meta"

    id: Mapped[ int ]         = Column(
        "id",
        Integer,
        primary_key=True
    )
    seria_id: Mapped[ int ] = Column(
        "seria_id",
        Integer,
        index=True
    )
    meta_key: Mapped[ str ]   = Column(
        "meta_key",
        String(20),
        default=""
    )
    meta_value: Mapped[ str ] = Column(
        "meta_value",
        Text,
        default=""
    )


#


class Anime(Base):
    __tablename__ = "anime"

    id: Mapped[ int ]       = Column(
        "id",
        Integer,
        primary_key=True
    )
    name: Mapped[ str ]     = Column(
        "name",
        Text,
        default=""
    )
    eng_name: Mapped[ str ] = Column(
        "eng_name",
        Text,
        default=""
    )
    slug: Mapped[ str ]     = Column(
        "slug",
        Text,
        default=""
    )
    cover_id: Mapped[ int ] = Column(
        "cover_id",
        Integer,
        nullable=True
    )
    # SYSTEM
    path: Mapped[ str ]     = Column(
        "path",
        Text,
        default=""
    )
    filename: Mapped[ str ] = Column(
        "filename",
        Text,
        default=""
    )
    filesize: Mapped[ int ] = Column(
        "filesize",
        Text,
        default="0"
    )
    _timestamp: Mapped[ datetime ] = Column(
        "updated",
        TIMESTAMP,
        default=datetime.now,
        onupdate=datetime.now
    )

    _cover: Mapped[ Cover ] = relationship(
        "Cover",
        foreign_keys=cover_id,
        remote_side="Cover.id",
        primaryjoin="foreign(Anime.cover_id) == Cover.id",
        viewonly=True,
    )
    
    # rels
    studios: Mapped[ List[ Studio ] ] = relationship(
        secondary=StudiosToAnime,
        order_by='Studio.name.asc()',
        overlaps="studios",
        # primaryjoin="foreign(anime_to_studio.c.anime_id) == Anime.id",
        # secondaryjoin="foreign(anime_to_studio.c.studio_id) == Studio.id",
    )

    genres: Mapped[ List[ Genre ] ] = relationship(
        secondary=GenresToAnime,
        order_by='Genre.name.asc()',
        overlaps="genres",
        # primaryjoin="foreign(anime_to_genre.c.anime_id) == Anime.id",
        # secondaryjoin="foreign(anime_to_genre.c.genre_id) == Genre.id",
    )

    voices: Mapped[ List[ Voice ] ] = relationship(
        secondary=VoicesToAnime,
        order_by='Voice.name.asc()',
        overlaps="voices",
        # primaryjoin="foreign(anime_to_voice.c.anime_id) == Anime.id",
        # secondaryjoin="foreign(anime_to_voice.c.voice_id) == Voice.id",
    )

    seasons: Mapped[ List[ AnimeSeason ] ] = relationship(
        "AnimeSeason",
        remote_side="AnimeSeason.anime_id",
        primaryjoin="foreign(AnimeSeason.anime_id) == Anime.id",
        order_by='AnimeSeason.number.asc()',
        # lazy="selectin"
    )

    _meta: Mapped[ List[ AnimeMeta ] ] = relationship(
        "AnimeMeta",
        remote_side="AnimeMeta.anime_id",
        primaryjoin="foreign(AnimeMeta.anime_id) == Anime.id",
    )

    @property
    def mono( self ) -> bool:
        return len( self.seasons ) == 1

    @property
    def cover(self) -> Cover|None:
        if self._cover:
            return self._cover
        if len( self.all_covers ) > 0:
            return self.all_covers[0]
        return None

    @property
    def timestamp( self ) -> int:
        timestamps = [ self._timestamp.timestamp() ]
        for season in self.seasons:
            timestamps.append( season.timestamp )
        return max( timestamps )

    @property
    def meta(self) -> Dict[str, Any]:
        result = {}
        for _m in self._meta:
            result[_m.meta_key] = _m.meta_value
        return result

    @property
    def ext(self) -> str:
        if not self.filename:
            return ''
        return self.filename.split('.')[-1]

    @property
    def download_path(self) -> str:
        if not self.filename:
            return ''
        return '/'.join( [ ANIME_WEB_PATH, *list( filter( None, [ self.path, self.filename ] ) ) ] )

    @property
    def fs_path(self) -> str:
        if not self.filename:
            return ''
        return os.path.join( *[ ANIME_FS_PATH, *list( filter( None, [ self.path, self.filename ] ) ) ] )

    @property
    def all_covers(self) -> List[ Cover ]:
        covers = []
        
        if self.seasons:
            for season in self.seasons:
                if season.cover:
                    covers.append( season.cover )
        
        return list(
            filter(
                None, list( dict.fromkeys( covers ) )
            )
        )

    @property
    def foldersize(self) -> int:
        size = 0

        if int( self.filesize ) > 0:
            return int( self.filesize )

        if len( self.seasons ) > 0:
            for season in self.seasons:
                if int( season.filesize ) > 0:
                    size += int(season.filesize)
                elif int( season.foldersize ) > 0:
                    size += int(season.foldersize)
        
        return size

Index("anime_fulltext", Anime.name, Anime.eng_name, mysql_prefix="FULLTEXT")


class AnimeSeason(Base):
    __tablename__ = "anime_season"

    id: Mapped[ int ]       = Column(
        "id",
        Integer,
        primary_key=True
    )
    anime_id: Mapped[ int ] = Column(
        "anime_id",
        Integer,
        index=True
    )
    number: Mapped[ float ] = Column(
        "number",
        Float
    )
    slug: Mapped[ str ]     = Column(
        "slug",
        Text
    )
    name: Mapped[ str ]     = Column(
        "name",
        Text,
        default=""
    )
    eng_name: Mapped[ str ] = Column(
        "eng_name",
        Text,
        default=""
    )
    cover_id: Mapped[ int ] = Column(
        "cover_id",
        Integer,
        nullable=True
    )
    # SYSTEM
    path: Mapped[ str ]     = Column(
        "path",
        Text,
        default=""
    )
    filename: Mapped[ str ] = Column(
        "filename",
        Text,
        default=""
    )
    filesize: Mapped[ int ] = Column(
        "filesize",
        Text,
        default="0"
    )
    _timestamp: Mapped[ datetime ] = Column(
        "updated",
        TIMESTAMP,
        default=datetime.now,
        onupdate=datetime.now
    )

    cover: Mapped[ Cover ] = relationship(
        "Cover",
        foreign_keys=cover_id,
        remote_side="Cover.id",
        primaryjoin="foreign(AnimeSeason.cover_id) == Cover.id",
        viewonly=True,
    )
    
    # rels
    studios: Mapped[ List[ Studio ] ] = relationship(
        secondary=StudiosToAnime,
        order_by='Studio.name.asc()',
        overlaps="studios",
        # primaryjoin="foreign(anime_to_studio.c.anime_id) == Anime.id",
        # secondaryjoin="foreign(anime_to_studio.c.studio_id) == Studio.id",
    )

    genres: Mapped[ List[ Genre ] ] = relationship(
        secondary=GenresToAnime,
        order_by='Genre.name.asc()',
        overlaps="genres",
        # primaryjoin="foreign(anime_to_genre.c.anime_id) == Anime.id",
        # secondaryjoin="foreign(anime_to_genre.c.genre_id) == Genre.id",
    )

    voices: Mapped[ List[ Voice ] ] = relationship(
        secondary=VoicesToAnime,
        order_by='Voice.name.asc()',
        overlaps="voices",
        # primaryjoin="foreign(anime_to_voice.c.anime_id) == Anime.id",
        # secondaryjoin="foreign(anime_to_voice.c.voice_id) == Voice.id",
    )

    anime: Mapped[ Anime ] = relationship(
        "Anime",
        foreign_keys=anime_id,
        remote_side="Anime.id",
        primaryjoin="foreign(AnimeSeason.anime_id) == Anime.id",
        # lazy='select',
        viewonly=True,
    )

    series: Mapped[ List[ AnimeSeria ] ] = relationship(
        "AnimeSeria",
        foreign_keys=id,
        remote_side="AnimeSeria.season_id",
        primaryjoin="foreign(AnimeSeria.season_id) == AnimeSeason.id",
        order_by='AnimeSeria.number.asc()',
        # lazy="selectin"
    )

    _meta: Mapped[ List[ AnimeSeasonMeta ] ] = relationship(
        "AnimeSeasonMeta",
        foreign_keys=id,
        remote_side="AnimeSeasonMeta.season_id",
        primaryjoin="foreign(AnimeSeasonMeta.season_id) == AnimeSeason.id",
    )

    @property
    def timestamp( self ) -> int:
        timestamps = [ self._timestamp.timestamp() ]
        for seria in self.series:
            timestamps.append( seria.timestamp )
        return max( timestamps )

    @property
    def meta(self) -> Dict[str, Any]:
        result = {}
        for _m in self._meta:
            result[_m.meta_key] = _m.meta_value
        return result

    @property
    def ext(self) -> str:
        if not self.filename:
            return ''
        return self.filename.split('.')[-1]

    @property
    def download_path(self) -> str:
        if not self.filename:
            return ''
        return '/'.join( [ ANIME_WEB_PATH, *list( filter( None, [ self.path, self.filename ] ) ) ] )

    @property
    def fs_path(self) -> str:
        if not self.filename:
            return ''
        return os.path.join( *[ ANIME_FS_PATH, *list( filter( None, [ self.path, self.filename ] ) ) ] )

    @property
    def foldersize(self) -> int:
        size = 0

        if int( self.filesize ) > 0:
            return int( self.filesize )

        if len( self.series ) > 0:
            for seria in self.series:
                if int( seria.filesize ) > 0:
                    size += int( seria.filesize )
        
        return size


class AnimeSeria(Base):
    __tablename__ = "anime_seria"

    id: Mapped[ int ]        = Column(
        "id",
        Integer,
        primary_key=True
    )
    season_id: Mapped[ int ] = Column(
        "season_id",
        Integer,
        index=True
    )
    number: Mapped[ float ]   = Column(
        "number",
        Float
    )
    name: Mapped[ str ]      = Column(
        "name",
        Text,
        default=""
    )
    eng_name: Mapped[ str ]   = Column(
        "eng_name",
        Text,
        default=""
    )
    # SYSTEM
    filename: Mapped[ str ]  = Column(
        "filename",
        Text,
        default=""
    )
    filesize: Mapped[ str ]  = Column(
        "filesize",
        Text,
        default="0"
    )
    _timestamp: Mapped[ datetime ] = Column(
        "updated",
        TIMESTAMP,
        default=datetime.now,
        onupdate=datetime.now
    )

    # rels
    season: Mapped[ AnimeSeason ] = relationship(
        "AnimeSeason",
        remote_side="AnimeSeason.id",
        primaryjoin="foreign(AnimeSeria.season_id) == AnimeSeason.id",
        lazy='select',
        viewonly=True,
    )

    _meta: Mapped[ List[ AnimeSeriaMeta ] ] = relationship(
        "AnimeSeriaMeta",
        remote_side="AnimeSeriaMeta.seria_id",
        primaryjoin="foreign(AnimeSeriaMeta.seria_id) == AnimeSeria.id",
    )

    @property
    def timestamp( self ) -> int:
        return self._timestamp.timestamp()

    @property
    def meta(self) -> Dict[str, Any]:
        result = {}
        for _m in self._meta:
            result[_m.meta_key] = _m.meta_value
        return result
    
    @property
    def season_number(self) -> float:
        return self.season.number

    @property
    def ext(self) -> str:
        if not self.filename:
            return ''
        return self.filename.split('.')[-1]

    @property
    def download_path(self) -> str:
        if not self.filename:
            return ''
        return '/'.join( [ ANIME_WEB_PATH, *list( filter( None, [ self.season.anime.path, self.season.path, self.filename ] ) ) ] )

    @property
    def fs_path(self) -> str:
        if not self.filename:
            return ''
        return os.path.join( *[ ANIME_FS_PATH, *list( filter( None, [ self.season.anime.path, self.season.path, self.filename ] ) ) ] )