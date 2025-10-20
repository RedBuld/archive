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

AuthorsToRanobe = Table(
    "r_authors_to_ranobe",
    Base.metadata,
    Column(
        "ranobe_id",
        Integer,
        ForeignKey('ranobe.id', ondelete="cascade"),
        index=True
    ),
    Column(
        "author_id",
        Integer,
        ForeignKey( "general_authors.id", ondelete="cascade" ),
    )
)


GenresToRanobe = Table(
    "r_genres_to_ranobe",
    Base.metadata,
    Column(
        "ranobe_id",
        Integer,
        ForeignKey('ranobe.id', ondelete="cascade"),
        index=True
    ),
    Column(
        "genre_id",
        Integer,
        ForeignKey( "general_genres.id", ondelete="cascade" ),
    )
)


TranslatorsToRanobe = Table(
    "r_translators_to_ranobe",
    Base.metadata,
    Column(
        "ranobe_id",
        Integer,
        ForeignKey('ranobe.id', ondelete="cascade"),
        index=True
    ),
    Column(
        "translator_id",
        Integer,
        ForeignKey( "general_translators.id", ondelete="cascade" ),
    )
)


#


class RanobeMeta(Base):
    __tablename__ = "ranobe_meta"

    id: Mapped[ int ] =\
        Column(
            "id",
            Integer,
            primary_key=True
        )
    ranobe_id: Mapped[ int ] =\
        Column(
            "ranobe_id",
            Integer,
            nullable=True,
            index=True
        )
    meta_key: Mapped[ str ] =\
        Column(
            "meta_key",
            String(20),
            default=""
        )
    meta_value: Mapped[ str ] =\
        Column(
            "meta_value",
            Text,
            default=""
        )


class RanobeVolumeMeta(Base):
    __tablename__ = "ranobe_volume_meta"

    id: Mapped[ int ] =\
        Column(
            "id",
            Integer,
            primary_key=True
        )
    volume_id: Mapped[ int ] =\
        Column(
            "volume_id",
            Integer,
            nullable=True,
            index=True
        )
    meta_key: Mapped[ str ] =\
        Column(
            "meta_key",
            String(20),
            default=""
        )
    meta_value: Mapped[ str ] =\
        Column(
            "meta_value",
            Text,
            default=""
        )


class RanobeChapterMeta(Base):
    __tablename__ = "ranobe_chapter_meta"

    id: Mapped[ int ] =\
        Column(
            "id",
            Integer,
            primary_key=True
        )
    chapter_id: Mapped[ int ] =\
        Column(
            "chapter_id",
            Integer,
            nullable=True,
            index=True
        )
    meta_key: Mapped[ str ] =\
        Column(
            "meta_key",
            String(20),
            default=""
        )
    meta_value: Mapped[ str ] =\
        Column(
            "meta_value",
            Text,
            default=""
        )


#


class Ranobe(Base):
    __tablename__ = "ranobe"

    id: Mapped[ int ] =\
        Column(
            "id",
            Integer,
            primary_key=True
        )
    name: Mapped[ str ] =\
        Column(
            "name",
            Text,
            default=""
        )
    eng_name: Mapped[ str ] =\
        Column(
            "eng_name",
            Text,
            default=""
        )
    slug: Mapped[ str ] =\
        Column(
            "slug",
            Text,
            default=""
        )
    cover_id: Mapped[ int ] =\
        Column(
            "cover_id",
            Integer,
            nullable=True
        )
    mature: Mapped[ bool ] =\
        Column(
            "mature",
            Boolean,
            default=False
        )
    # META
    status: Mapped[ str ] =\
        Column(
            "status",
            String(50),
            default=""
        )
    # SYSTEM
    path: Mapped[ str ] =\
        Column(
            "path",
            Text,
            default=""
        )
    _timestamp: Mapped[ datetime ] =\
        Column(
            "updated",
            TIMESTAMP,
            default=datetime.now,
            onupdate=datetime.now
        )

    _cover: Mapped[ Cover ] = relationship(
        "Cover",
        foreign_keys=cover_id,
        remote_side="Cover.id",
        primaryjoin="foreign(Ranobe.cover_id) == Cover.id",
        viewonly=True,
    )

    # rels
    authors: Mapped[ List[ Author ] ] = relationship(
        secondary=AuthorsToRanobe,
        order_by='Author.name.asc()'
    )

    genres: Mapped[ List[ Genre ] ] = relationship(
        secondary=GenresToRanobe,
        order_by='Genre.name.asc()'
    )

    translators: Mapped[ List[ Translator ] ] = relationship(
        secondary=TranslatorsToRanobe,
        order_by='Translator.name.asc()'
    )
    
    volumes: Mapped[ List[ RanobeVolume ] ] = relationship(
        "RanobeVolume",
        foreign_keys=id,
        remote_side="RanobeVolume.ranobe_id",
        primaryjoin="foreign(RanobeVolume.ranobe_id) == Ranobe.id",
        order_by='RanobeVolume.number.asc()',
        # lazy="selectin"
    )

    _meta: Mapped[ List[ RanobeMeta ] ] = relationship(
        "RanobeMeta",
        remote_side="RanobeMeta.ranobe_id",
        primaryjoin="foreign(RanobeMeta.ranobe_id) == Ranobe.id",
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

Index("ranobe_fulltext", Ranobe.name, Ranobe.eng_name, mysql_prefix="FULLTEXT")

class RanobeVolume(Base):
    __tablename__ = "ranobe_volume"

    id: Mapped[ int ] =\
        Column(
            "id",
            Integer,
            primary_key=True
        )
    ranobe_id: Mapped[ int ] =\
        Column(
            "ranobe_id",
            Integer,
            index=True
        )
    number: Mapped[ float ] =\
        Column(
            "number",
            Float
        )
    translator_id: Mapped[ int ] =\
        Column(
            "translator_id",
            Integer,
            index=True
        )
    name: Mapped[ str ] =\
        Column(
            "name",
            Text,
            default=""
        )
    eng_name: Mapped[ str ] =\
        Column(
            "eng_name",
            Text,
            default=""
        )
    slug: Mapped[ str ] =\
        Column(
            "slug",
            Text,
            default=""
        )
    cover_id: Mapped[ int ] =\
        Column(
            "cover_id",
            Integer,
            nullable=True
        )
    # META
    status: Mapped[ str ] =\
        Column(
            "status",
            Text,
            default=""
        )
    # SYSTEM
    path: Mapped[ str ] =\
        Column(
            "path",
            Text,
            default=""
        )
    filename: Mapped[ str ] =\
        Column(
            "filename",
            Text,
            default=""
        )
    filesize: Mapped[ int ] =\
        Column(
            "filesize",
            Text,
            default="0"
        )
    _timestamp: Mapped[ datetime ] =\
        Column(
            "updated",
            TIMESTAMP,
            default=datetime.now,
            onupdate=datetime.now
        )

    ranobe: Mapped[ Ranobe ] = relationship(
        "Ranobe",
        foreign_keys=ranobe_id,
        remote_side="Ranobe.id",
        primaryjoin="foreign(RanobeVolume.ranobe_id) == Ranobe.id",
        # lazy='select',
        viewonly=True,
    )

    cover: Mapped[ Cover ] = relationship(
        "Cover",
        foreign_keys=cover_id,
        remote_side="Cover.id",
        primaryjoin="foreign(RanobeVolume.cover_id) == Cover.id",
        viewonly=True,
    )
    
    chapters: Mapped[ List[ RanobeChapter ] ] = relationship(
        "RanobeChapter",
        foreign_keys=id,
        remote_side="RanobeChapter.volume_id",
        primaryjoin="foreign(RanobeChapter.volume_id) == RanobeVolume.id",
        order_by='RanobeChapter.number.asc()',
        # lazy="selectin"
    )

    _meta: Mapped[ List[ RanobeVolumeMeta ] ] = relationship(
        "RanobeVolumeMeta",
        remote_side="RanobeVolumeMeta.volume_id",
        primaryjoin="foreign(RanobeVolumeMeta.volume_id) == RanobeVolume.id",
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
        return '/'.join( [ RANOBE_WEB_PATH, *list( filter( None, [ self.ranobe.path, self.path, self.filename ] ) ) ] )
    
    @property
    def fs_path(self) -> str:
        if not self.filename:
            return ''
        return os.path.join( *[ RANOBE_FS_PATH, *list( filter( None, [ self.ranobe.path, self.path, self.filename ] ) ) ] )

    @property
    def foldersize(self) -> int:
        size = 0

        if len( self.chapters ) > 0:
            for chapter in self.chapters:
                if int( chapter.filesize ) > 0:
                    size += int( chapter.filesize )
        
        return size

class RanobeChapter(Base):
    __tablename__ = "ranobe_chapter"

    id: Mapped[ int ] =\
        Column(
            "id",
            Integer,
            primary_key=True
        )
    volume_id: Mapped[ int ] =\
        Column(
            "volume_id",
            Integer,
            index=True
        )
    number: Mapped[ float ] =\
        Column(
            "number",
            Float
        )
    name: Mapped[ str ] =\
        Column(
            "name",
            Text,
            default=""
        )
    eng_name: Mapped[ str ] =\
        Column(
            "eng_name",
            Text,
            default=""
        )
    # SYSTEM
    path: Mapped[ str ] =\
        Column(
            "path",
            Text,
            default=""
        )
    filename: Mapped[ str ] =\
        Column(
            "filename",
            Text,
            default=""
        )
    filesize: Mapped[ int ] =\
        Column(
            "filesize",
            Text,
            default="0"
        )
    _timestamp: Mapped[ datetime ] =\
        Column(
        "updated",
        TIMESTAMP,
        default=datetime.now,
        onupdate=datetime.now
    )

    # rels
    volume: Mapped[ RanobeVolume ] = relationship(
        "RanobeVolume",
        foreign_keys=volume_id,
        remote_side="RanobeVolume.id",
        primaryjoin="foreign(RanobeChapter.volume_id) == RanobeVolume.id",
        lazy='select',
        viewonly=True,
    )

    _meta: Mapped[ List[ RanobeChapterMeta ] ] = relationship(
        "RanobeChapterMeta",
        remote_side="RanobeChapterMeta.chapter_id",
        primaryjoin="foreign(RanobeChapterMeta.chapter_id) == RanobeChapter.id",
    )

    @property
    def timestamp( self ) -> int:
        return self._timestamp.timestamp()

    @property
    def volume_number(self) -> float:
        return self.volume.number

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
        return '/'.join( [ RANOBE_WEB_PATH, *list( filter( None, [ self.volume.ranobe.path, self.volume.path, self.path, self.filename ] ) ) ] )
    
    @property
    def fs_path(self) -> str:
        if not self.filename:
            return ''
        return os.path.join( *[ RANOBE_FS_PATH, *list( filter( None, [ self.volume.ranobe.path, self.volume.path, self.path, self.filename ] ) ) ] )