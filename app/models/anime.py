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
from .shared import *

#


AnimeStudios = Table(
    "_rel_anime_studios",
    Base.metadata,
    Column(
        "anime_id",
        BigInteger,
        ForeignKey('anime.id', ondelete="cascade"),
        nullable=True,
        default=None,
        index=True
    ),
    Column(
        "season_id",
        BigInteger,
        ForeignKey('anime_season.id', ondelete="cascade"),
        nullable=True,
        default=None,
        index=True
    ),
    Column(
        "studio_id",
        BigInteger,
        ForeignKey( "general_studios.id", ondelete="cascade" ),
    )
)


AnimeGenres = Table(
    "_rel_anime_genres",
    Base.metadata,
    Column(
        "anime_id",
        BigInteger,
        ForeignKey('anime.id', ondelete="cascade"),
        nullable=True,
        default=None,
        index=True
    ),
    Column(
        "season_id",
        BigInteger,
        ForeignKey('anime_season.id', ondelete="cascade"),
        nullable=True,
        default=None,
        index=True
    ),
    Column(
        "genre_id",
        BigInteger,
        ForeignKey( "general_genres.id", ondelete="cascade" ),
    )
)


AnimeVoices = Table(
    "_rel_anime_voices",
    Base.metadata,
    Column(
        "anime_id",
        BigInteger,
        ForeignKey('anime.id', ondelete="cascade"),
        nullable=True,
        default=None,
        index=True
    ),
    Column(
        "season_id",
        BigInteger,
        ForeignKey('anime_season.id', ondelete="cascade"),
        nullable=True,
        default=None,
        index=True
    ),
    Column(
        "voice_id",
        BigInteger,
        ForeignKey( "general_voices.id", ondelete="cascade" ),
    )
)

# Обложки
class AnimeCovers(Base):
    __tablename__ = "_rel_anime_covers"

    anime_id: Mapped[ int ] =\
        Column(
            "anime_id",
            BigInteger,
            ForeignKey('animes.id', ondelete="cascade"),
            nullable=True,
            index=True
        )
    season_id: Mapped[ int ] =\
        Column(
            "season_id",
            BigInteger,
            ForeignKey('anime_seasons.id', ondelete="cascade"),
            nullable=True,
            index=True
        )
    image_id: Mapped[ int ] =\
        Column(
            "image_id",
            BigInteger,
            ForeignKey( "general_images.id", ondelete="cascade" ),
            index=True
        )
    index: Mapped[ int ] =\
        Column(
            "index",
            Integer
        )
    role: Mapped[ str ] =\
        Column(
            "role",
            String(10),
            index=True
        )

# 


#


class AnimeMeta(Base):
    __tablename__ = "animes_meta"

    id: Mapped[ int ]         = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    anime_id: Mapped[ int ]   = Column(
        "anime_id",
        BigInteger,
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
    __tablename__ = "anime_seasons_meta"

    id: Mapped[ int ]         = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    season_id: Mapped[ int ]  = Column(
        "season_id",
        BigInteger,
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
    __tablename__ = "anime_series_meta"

    id: Mapped[ int ]         = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    seria_id: Mapped[ int ] = Column(
        "seria_id",
        BigInteger,
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
    __tablename__ = "animes"
    __table_args__ = (
        Index("a_title_idx", "title", mysql_length=512),
        Index("a_rus_title_idx", "rus_title", mysql_length=512),
    )

    id: Mapped[ int ]       = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    title: Mapped[ str ]     = Column(
        "title",
        Text,
        default=""
    )
    rus_title: Mapped[ str ] = Column(
        "rus_title",
        Text,
        default=""
    )
    slug: Mapped[ str ]     = Column(
        "slug",
        Text,
        default=""
    )
    # META
    age_restriction: Mapped[ int ] =\
        Column(
            "age_restriction",
            BigInteger,
            ForeignKey( "general_age_restrictions.id", ondelete="SET NULL" ),
            nullable=True
        )
    release_status: Mapped[ str ] =\
        Column(
            "release_status",
            BigInteger,
            ForeignKey( "general_release_statuses.id", ondelete="SET NULL" ),
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
    
    # 

    # Обложки
    covers: Mapped[ List[ Image ] ] = relationship(
        "Image",
        secondary=AnimeCovers.__tablename__,
        primaryjoin="and_( foreign(AnimeCovers.anime_id) == Anime.id, AnimeCovers.role=='cover')",
        secondaryjoin="foreign(AnimeCovers.image_id) == Image.id",
        order_by='AnimeCovers.index.asc()',
        lazy=True,
        viewonly=True,
    )
    background: Mapped[ Image ] = relationship(
        "Image",
        secondary=AnimeCovers.__tablename__,
        primaryjoin="and_( foreign(AnimeCovers.anime_id) == Anime.id, AnimeCovers.role=='bg')",
        secondaryjoin="foreign(AnimeCovers.image_id) == Image.id",
        order_by='AnimeCovers.index.asc()',
        lazy=True,
        viewonly=True,
    )

    # Студии
    studios: Mapped[ List[ Studio ] ] = relationship(
        secondary=AnimeStudios,
        order_by='Studio.name.asc()',
        lazy=True
    )

    # Озвучки
    voices: Mapped[ List[ Voice ] ] = relationship(
        secondary=AnimeVoices,
        order_by='Voice.name.asc()',
        lazy=True
    )

    # Жанры
    genres: Mapped[ List[ Genre ] ] = relationship(
        secondary=AnimeGenres,
        order_by='Genre.name.asc()',
        lazy=True
    )
    
    # Сезоны
    seasons: Mapped[ List[ AnimeSeason ] ] = relationship(
        "AnimeSeason",
        foreign_keys=id,
        remote_side="AnimeSeason.anime_id",
        primaryjoin="foreign(AnimeSeason.anime_id) == Ranobe.id",
        order_by='AnimeSeason.number.asc()',
        lazy=True
    )

    # Дополнительные метаданные
    _meta: Mapped[ List[ AnimeMeta ] ] = relationship(
        "AnimeMeta",
        remote_side="AnimeMeta.anime_id",
        primaryjoin="foreign(AnimeMeta.anime_id) == Anime.id",
    )

    @property
    def fullmeter( self ) -> bool:
        return self.filename != ''

    @property
    def mono( self ) -> bool:
        return len( self.seasons ) == 1

    @property
    def cover(self) -> Image|None:
        if len( self.covers ) > 0:
            return self.covers[ 0 ]
        return None

    # @property
    # def timestamp( self ) -> int:
    #     timestamps = [ self._timestamp.timestamp() ]
    #     for season in self.seasons:
    #         timestamps.append( season.timestamp )
    #     return max( timestamps )

    @property
    def meta(self) -> Dict[str, Any]:
        result = {}
        for _m in self._meta:
            result[ _m.meta_key ] = _m.meta_value
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

    # @property
    # def all_covers(self) -> List[ Image ]:
    #     covers = []
        
    #     if self.seasons:
    #         for season in self.seasons:
    #             if season.cover:
    #                 covers.append( season.cover )
        
    #     return list(
    #         filter(
    #             None, list( dict.fromkeys( covers ) )
    #         )
    #     )

    # @property
    # def foldersize(self) -> int:
    #     size = 0

    #     if int( self.filesize ) > 0:
    #         return int( self.filesize )

    #     if len( self.seasons ) > 0:
    #         for season in self.seasons:
    #             if int( season.filesize ) > 0:
    #                 size += int(season.filesize)
    #             elif int( season.foldersize ) > 0:
    #                 size += int(season.foldersize)
        
    #     return size


class AnimeSeason(Base):
    __tablename__ = "anime_seasons"

    id: Mapped[ int ]       = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    anime_id: Mapped[ int ] = Column(
        "anime_id",
        BigInteger,
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
        BigInteger,
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

    cover: Mapped[ Image ] = relationship(
        "Image",
        foreign_keys=cover_id,
        remote_side="Image.id",
        primaryjoin="foreign(AnimeSeason.cover_id) == Image.id",
        viewonly=True,
    )
    
    # rels
    studios: Mapped[ List[ Studio ] ] = relationship(
        secondary=AnimeStudios,
        order_by='Studio.name.asc()',
        overlaps="studios",
        # primaryjoin="foreign(anime_to_studio.c.anime_id) == Anime.id",
        # secondaryjoin="foreign(anime_to_studio.c.studio_id) == Studio.id",
    )

    genres: Mapped[ List[ Genre ] ] = relationship(
        secondary=AnimeGenres,
        order_by='Genre.name.asc()',
        overlaps="genres",
        # primaryjoin="foreign(anime_to_genre.c.anime_id) == Anime.id",
        # secondaryjoin="foreign(anime_to_genre.c.genre_id) == Genre.id",
    )

    voices: Mapped[ List[ Voice ] ] = relationship(
        secondary=AnimeVoices,
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
    __tablename__ = "anime_series"

    id: Mapped[ int ]        = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    season_id: Mapped[ int ] = Column(
        "season_id",
        BigInteger,
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