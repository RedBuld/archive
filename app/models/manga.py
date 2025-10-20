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

AuthorsToManga = Table(
    "r_authors_to_manga",
    Base.metadata,
    Column(
        "manga_id",
        Integer,
        ForeignKey('manga.id', ondelete="cascade"),
        index=True
    ),
    Column(
        "author_id",
        Integer,
        ForeignKey( "general_authors.id", ondelete="cascade" ),
    )
)


GenresToManga = Table(
    "r_genres_to_manga",
    Base.metadata,
    Column(
        "manga_id",
        Integer,
        ForeignKey('manga.id', ondelete="cascade"),
        index=True
    ),
    Column(
        "genre_id",
        Integer,
        ForeignKey( "general_genres.id", ondelete="cascade" ),
    )
)


#


class MangaMeta(Base):
    __tablename__ = "manga_meta"

    id: Mapped[ int ]         = Column(
        "id",
        Integer,
        primary_key=True
    )
    manga_id: Mapped[ int ]   = Column(
        "manga_id",
        Integer,
        nullable=True,
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


class MangaVolumeMeta(Base):
    __tablename__ = "manga_volume_meta"

    id: Mapped[ int ]         = Column(
        "id",
        Integer,
        primary_key=True
    )
    volume_id: Mapped[ int ]  = Column(
        "volume_id",
        Integer,
        nullable=True,
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


class MangaChapterMeta(Base):
    __tablename__ = "manga_chapter_meta"

    id: Mapped[ int ]         = Column(
        "id",
        Integer,
        primary_key=True
    )
    chapter_id: Mapped[ int ] = Column(
        "chapter_id",
        Integer,
        nullable=True,
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


class Manga(Base):
    __tablename__ = "manga"

    id: Mapped[ int ]              = Column(
        "id",
        Integer,
        primary_key=True
    )
    name: Mapped[ str ]            = Column(
        "name",
        Text,
        default=""
    )
    eng_name: Mapped[ str ]         = Column(
        "eng_name",
        Text,
        default=""
    )
    slug: Mapped[ str ]            = Column(
        "slug",
        Text,
        default=""
    )
    cover_id: Mapped[ int ]        = Column(
        "cover_id",
        Integer,
        nullable=True
    )
    mature: Mapped[ bool ]         = Column(
        "mature",
        Boolean,
        default=False
    )
    # Meta
    status: Mapped[ str ]          = Column(
        "status",
        String(50),
        default=""
    )
    # SYSTEM
    path: Mapped[ str ]            = Column(
        "path",
        Text,
        default=""
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
        primaryjoin="foreign(Manga.cover_id) == Cover.id",
        viewonly=True,
    )

    # rels
    authors: Mapped[ List[ Author ] ] = relationship(
        secondary=AuthorsToManga,
        order_by='Author.name.asc()'
    )

    genres: Mapped[ List[ Genre ] ] = relationship(
        secondary=GenresToManga,
        order_by='Genre.name.asc()'
    )
    
    volumes: Mapped[ List[ MangaVolume ] ] = relationship(
        "MangaVolume",
        foreign_keys=id,
        remote_side="MangaVolume.manga_id",
        primaryjoin="foreign(MangaVolume.manga_id) == Manga.id",
        order_by='MangaVolume.number.asc()',
        # lazy="selectin"
    )

    _meta: Mapped[ List[ MangaMeta ] ] = relationship(
        "MangaMeta",
        remote_side="MangaMeta.manga_id",
        primaryjoin="foreign(MangaMeta.manga_id) == Manga.id",
    )

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
        for volume in self.volumes:
            timestamps.append( volume.timestamp )
        return max( timestamps )

    @property
    def meta(self) -> Dict[str, Any]:
        result = {}
        for _m in self._meta:
            result[_m.meta_key] = _m.meta_value
        return result

    @property
    def all_covers(self) -> List[ Cover ]:
        covers = []

        if self.volumes:
            for volume in self.volumes:
                if volume.cover:
                    covers.append( volume.cover )

        return list(
            filter(
                None, list( dict.fromkeys( covers ) )
            )
        )

    @property
    def foldersize(self) -> int:
        size = 0

        if len( self.volumes ) > 0:
            for volume in self.volumes:
                if int( volume.filesize ) > 0:
                    size += int( volume.filesize )
                if int( volume.foldersize ) > 0:
                    size += int( volume.foldersize )

        return size

Index("manga_fulltext", Manga.name, Manga.eng_name, mysql_prefix="FULLTEXT")

class MangaVolume(Base):
    __tablename__ = "manga_volume"

    id: Mapped[ int ]         = Column(
        "id",
        Integer,
        primary_key=True
    )
    manga_id: Mapped[ int ]   = Column(
        "manga_id",
        Integer,
        index=True
    )
    number: Mapped[ float ]   = Column(
        "number",
        Float
    )
    name: Mapped[ str ]       = Column(
        "name",
        Text,
        default=""
    )
    eng_name: Mapped[ str ]    = Column(
        "eng_name",
        Text,
        default=""
    )
    slug: Mapped[ str ]       = Column(
        "slug",
        Text,
        default=""
    )
    cover_id: Mapped[ int ]   = Column(
        "cover_id",
        Integer,
        nullable=True
    )
    # Meta
    status: Mapped[ str ]     = Column(
        "status",
        Text,
        default=""
    )
    # SYSTEM
    path: Mapped[ str ]       = Column(
        "path",
        Text,
        default=""
    )
    filename: Mapped[ str ]   = Column(
        "filename",
        Text,
        default=""
    )
    filesize: Mapped[ int ]   = Column(
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

    manga: Mapped[ Manga ] = relationship(
        "Manga",
        foreign_keys=manga_id,
        remote_side="Manga.id",
        primaryjoin="foreign(MangaVolume.manga_id) == Manga.id",
        # lazy='select',
        viewonly=True,
    )

    cover: Mapped[ Cover ] = relationship(
        "Cover",
        foreign_keys=cover_id,
        remote_side="Cover.id",
        primaryjoin="foreign(MangaVolume.cover_id) == Cover.id",
        viewonly=True,
    )
    
    chapters: Mapped[ List[ MangaChapter ] ] = relationship(
        "MangaChapter",
        foreign_keys=id,
        remote_side="MangaChapter.volume_id",
        primaryjoin="foreign(MangaChapter.volume_id) == MangaVolume.id",
        order_by='MangaChapter.number.asc()',
        # lazy="selectin"
    )

    _meta: Mapped[ List[ MangaVolumeMeta ] ] = relationship(
        "MangaVolumeMeta",
        remote_side="MangaVolumeMeta.volume_id",
        primaryjoin="foreign(MangaVolumeMeta.volume_id) == MangaVolume.id",
    )

    @property
    def timestamp( self ) -> int:
        timestamps = [ self._timestamp.timestamp() ]
        for chapter in self.chapters:
            timestamps.append( chapter.timestamp )
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
        return '/'.join( [ MANGA_WEB_PATH, *list( filter( None, [ self.manga.path, self.path, self.filename ] ) ) ] )
    
    @property
    def fs_path(self) -> str:
        if not self.filename:
            return ''
        return os.path.join( *[ MANGA_FS_PATH, *list( filter( None, [ self.manga.path, self.path, self.filename ] ) ) ] )

    @property
    def foldersize(self) -> int:
        size = 0

        if len( self.chapters ) > 0:
            for chapter in self.chapters:
                if int( chapter.filesize ) > 0:
                    size += int( chapter.filesize )
        
        return size

class MangaChapter(Base):
    __tablename__ = "manga_chapter"

    id: Mapped[ int ]        = Column(
        "id",
        Integer,
        primary_key=True
    )
    volume_id: Mapped[ int ] = Column(
        "volume_id",
        Integer,
        index=True
    )
    number: Mapped[ float ]  = Column(
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
    filesize: Mapped[ int ]  = Column(
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
    volume: Mapped[ MangaVolume ] = relationship(
        "MangaVolume",
        foreign_keys=volume_id,
        remote_side="MangaVolume.id",
        primaryjoin="foreign(MangaChapter.volume_id) == MangaVolume.id",
        lazy='select',
        viewonly=True,
    )

    _meta: Mapped[ List[ MangaChapterMeta ] ] = relationship(
        "MangaChapterMeta",
        remote_side="MangaChapterMeta.chapter_id",
        primaryjoin="foreign(MangaChapterMeta.chapter_id) == MangaChapter.id",
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
    def volume_number(self) -> float:
        return self.volume.number

    @property
    def ext(self) -> str:
        if not self.filename:
            return ''
        return self.filename.split('.')[-1]

    @property
    def download_path(self) -> str:
        if not self.filename:
            return ''
        return '/'.join( [ MANGA_WEB_PATH, *list( filter( None, [ self.volume.manga.path, self.volume.path, self.filename ] ) ) ] )

    @property
    def fs_path(self) -> str:
        if not self.filename:
            return ''
        return os.path.join( *[ MANGA_FS_PATH, *list( filter( None, [ self.volume.manga.path, self.volume.path, self.filename ] ) ) ] )