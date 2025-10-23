from __future__ import annotations

import os
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy import Table, Column
from sqlalchemy import SmallInteger, Integer, BigInteger, Float, String, Text, Boolean, Date, DateTime, Computed, JSON, UniqueConstraint, ForeignKey, Index
from sqlalchemy.dialects.mysql import TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped
from app.db import DB
from app.db import Base

from app.models.shared import *
from app.models.teams import Team
#

# Авторы
RanobeAuthors = Table(
    "_rel_ranobes_authors",
    Base.metadata,
    Column(
        "ranobe_id",
        BigInteger,
        ForeignKey('ranobes.id', ondelete="cascade"),
        primary_key=True
    ),
    Column(
        "author_id",
        BigInteger,
        ForeignKey( "general_authors.id", ondelete="cascade" ),
        primary_key=True
    )
)

# Художники
RanobeArtists = Table(
    "_rel_ranobes_artists",
    Base.metadata,
    Column(
        "ranobe_id",
        BigInteger,
        ForeignKey('ranobes.id', ondelete="cascade"),
        primary_key=True
    ),
    Column(
        "artist_id",
        BigInteger,
        ForeignKey( "general_authors.id", ondelete="cascade" ),
        primary_key=True
    )
)

# Жанры
RanobeGenres = Table(
    "_rel_ranobes_genres",
    Base.metadata,
    Column(
        "ranobe_id",
        BigInteger,
        ForeignKey('ranobes.id', ondelete="cascade"),
        primary_key=True
    ),
    Column(
        "genre_id",
        BigInteger,
        ForeignKey( "general_genres.id", ondelete="cascade" ),
        primary_key=True
    )
)

# Обложки
class RanobeCovers(Base):
    __tablename__ = "_rel_ranobes_covers"
    __mapper_args__ = {
        "primary_key": ["ranobe_id", "volume_id", "image_id"]
    }

    ranobe_id: Mapped[ int ] =\
        Column(
            "ranobe_id",
            BigInteger,
            ForeignKey('ranobes.id', ondelete="cascade"),
            nullable=True,
            index=True
        )
    volume_id: Mapped[ int ] =\
        Column(
            "volume_id",
            BigInteger,
            ForeignKey('ranobes_volumes.id', ondelete="cascade"),
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

# Ветки перевода от команд и отдельных пользователей
class RanobeTranslationBranche(Base):
    __tablename__ = "ranobes_translation_branches"
    __table_args__ = (
        Index("rtb_ranobes_idx", "ranobe_id"),
        Index("rtb_translator_idx", "ranobe_id", "team_id"),
    )

    id: Mapped[ int ] =\
        Column(
            "id",
            BigInteger,
            primary_key=True
        )
    ranobe_id: Mapped[ int ] =\
        Column(
            "ranobe_id",
            BigInteger,
            ForeignKey('ranobes.id', ondelete="cascade")
        )
    team_id: Mapped[ int ] =\
        Column(
            "team_id",
            BigInteger,
            ForeignKey( "teams.id", ondelete="cascade" )
        )

    team: Mapped[ Team ] = relationship(
        "Team",
        foreign_keys=team_id,
        remote_side="Team.id",
        primaryjoin="foreign(RanobeTranslationBranche.team_id) == Team.id",
        lazy='noload',
        viewonly=True
    )


#


class RanobeMeta(Base):
    __tablename__ = "ranobes_meta"

    id: Mapped[ int ] =\
        Column(
            "id",
            BigInteger,
            primary_key=True
        )
    ranobe_id: Mapped[ int ] =\
        Column(
            "ranobe_id",
            BigInteger,
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
    __tablename__ = "ranobes_volumes_meta"

    id: Mapped[ int ] =\
        Column(
            "id",
            BigInteger,
            primary_key=True
        )
    volume_id: Mapped[ int ] =\
        Column(
            "volume_id",
            BigInteger,
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


# class RanobeChapterMeta(Base):
#     __tablename__ = "ranobes_chapter_meta"

#     id: Mapped[ int ] =\
#         Column(
#             "id",
#             BigInteger,
#             primary_key=True
#         )
#     chapter_id: Mapped[ int ] =\
#         Column(
#             "chapter_id",
#             BigInteger,
#             nullable=True,
#             index=True
#         )
#     meta_key: Mapped[ str ] =\
#         Column(
#             "meta_key",
#             String(20),
#             default=""
#         )
#     meta_value: Mapped[ str ] =\
#         Column(
#             "meta_value",
#             Text,
#             default=""
#         )


#


class Ranobe(Base):
    __tablename__ = "ranobes"
    __table_args__ = (
        Index("r_title_idx", "title", mysql_length=512),
        Index("r_rus_title_idx", "rus_title", mysql_length=512),
    )

    id: Mapped[ int ] =\
        Column(
            "id",
            BigInteger,
            primary_key=True
        )
    title: Mapped[ str ] =\
        Column(
            "title",
            Text,
            default=""
        )
    rus_title: Mapped[ str ] =\
        Column(
            "rus_title",
            Text,
            default=""
        )
    slug: Mapped[ str ] =\
        Column(
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
    translation_status: Mapped[ str ] =\
        Column(
            "translation_status",
            BigInteger,
            ForeignKey( "general_translation_statuses.id", ondelete="SET NULL" ),
            nullable=True
        )
    
    # 

    # Обложки
    covers: Mapped[ List[ Image ] ] = relationship(
        "Image",
        secondary=RanobeCovers.__tablename__,
        primaryjoin="and_( foreign(RanobeCovers.ranobe_id) == Ranobe.id, RanobeCovers.role=='cover')",
        secondaryjoin="foreign(RanobeCovers.image_id) == Image.id",
        order_by='RanobeCovers.index.asc()',
        lazy='noload',
        viewonly=True,
    )
    background: Mapped[ Image ] = relationship(
        "Image",
        secondary=RanobeCovers.__tablename__,
        primaryjoin="and_( foreign(RanobeCovers.ranobe_id) == Ranobe.id, RanobeCovers.role=='bg')",
        secondaryjoin="foreign(RanobeCovers.image_id) == Image.id",
        order_by='RanobeCovers.index.asc()',
        lazy='noload',
        viewonly=True,
    )

    # Авторы
    authors: Mapped[ List[ Author ] ] = relationship(
        secondary=RanobeAuthors,
        order_by='Author.name.asc()',
        lazy='noload'
    )

    # Художники
    artists: Mapped[ List[ Author ] ] = relationship(
        secondary=RanobeArtists,
        order_by='Author.name.asc()',
        lazy='noload'
    )

    # Жанры
    genres: Mapped[ List[ Genre ] ] = relationship(
        secondary=RanobeGenres,
        order_by='Genre.name.asc()',
        lazy='noload'
    )

    # Ветки перевода
    branches: Mapped[ List[ RanobeTranslationBranche ] ] = relationship(
        "RanobeTranslationBranche",
        foreign_keys=id,
        remote_side="RanobeTranslationBranche.ranobe_id",
        primaryjoin="foreign(RanobeTranslationBranche.ranobe_id) == Ranobe.id",
        order_by='RanobeTranslationBranche.id.asc()',
        lazy='noload'
    )
    
    # Тома
    volumes: Mapped[ List[ RanobeVolume ] ] = relationship(
        "RanobeVolume",
        foreign_keys=id,
        remote_side="RanobeVolume.ranobe_id",
        primaryjoin="foreign(RanobeVolume.ranobe_id) == Ranobe.id",
        order_by='RanobeVolume.number.asc()',
        lazy='noload'
    )

    # Дополнительные метаданные
    _meta: Mapped[ List[ RanobeMeta ] ] = relationship(
        "RanobeMeta",
        remote_side="RanobeMeta.ranobe_id",
        primaryjoin="foreign(RanobeMeta.ranobe_id) == Ranobe.id",
        lazy='noload'
    )

    @property
    def cover(self) -> Image|None:
        if len( self.covers ) > 0:
            return self.covers[ 0 ]
        return None

    @property
    def meta(self) -> Dict[str, Any]:
        result = {}
        for _m in self._meta:
            result[ _m.meta_key ] = _m.meta_value
        return result
    
    def __repr__(
        self
    ) -> str:
        return f'(Ranobe id:{self.id}, rus_title:{self.rus_title}, title:{self.title})'


class RanobeVolume(Base):
    __tablename__ = "ranobes_volumes"

    id: Mapped[ int ] =\
        Column(
            "id",
            BigInteger,
            primary_key=True
        )
    ranobe_id: Mapped[ int ] =\
        Column(
            "ranobe_id",
            BigInteger,
            index=True
        )
    number: Mapped[ float ] =\
        Column(
            "number",
            Float
        )
    title: Mapped[ str ] =\
        Column(
            "title",
            Text,
            default=""
        )
    # META
    release_status: Mapped[ str ] =\
        Column(
            "release_status",
            BigInteger,
            ForeignKey( "general_release_statuses.id", ondelete="SET NULL" ),
            nullable=True
        )
    translation_status: Mapped[ str ] =\
        Column(
            "translation_status",
            BigInteger,
            ForeignKey( "general_translation_statuses.id", ondelete="SET NULL" ),
            nullable=True
        )
    # SYSTEM
    # path: Mapped[ str ] =\
    #     Column(
    #         "path",
    #         Text,
    #         default=""
    #     )
    # filename: Mapped[ str ] =\
    #     Column(
    #         "filename",
    #         Text,
    #         default=""
    #     )
    # filesize: Mapped[ int ] =\
    #     Column(
    #         "filesize",
    #         Text,
    #         default="0"
    #     )
    # _timestamp: Mapped[ datetime ] =\
    #     Column(
    #         "updated",
    #         TIMESTAMP,
    #         default=datetime.now,
    #         onupdate=datetime.now
    #     )

    ranobe: Mapped[ Ranobe ] = relationship(
        "Ranobe",
        foreign_keys=ranobe_id,
        remote_side="Ranobe.id",
        primaryjoin="foreign(RanobeVolume.ranobe_id) == Ranobe.id",
        lazy='noload',
        viewonly=True,
    )

    cover: Mapped[ Image ] = relationship(
        "Image",
        secondary=RanobeCovers.__tablename__,
        primaryjoin="and_( foreign(RanobeCovers.ranobe_id) == Ranobe.id, foreign(RanobeCovers.volume_id) == RanobeVolume.id, RanobeCovers.role=='cover')",
        secondaryjoin="foreign(RanobeCovers.image_id) == Image.id",
        order_by='RanobeCovers.index.asc()',
        lazy='noload',
        viewonly=True,
    )
    
    chapters: Mapped[ List[ RanobeChapter ] ] = relationship(
        "RanobeChapter",
        foreign_keys=id,
        remote_side="RanobeChapter.volume_id",
        primaryjoin="foreign(RanobeChapter.volume_id) == RanobeVolume.id",
        order_by='RanobeChapter.number.asc()',
        lazy='noload'
    )

    _meta: Mapped[ List[ RanobeVolumeMeta ] ] = relationship(
        "RanobeVolumeMeta",
        remote_side="RanobeVolumeMeta.volume_id",
        primaryjoin="foreign(RanobeVolumeMeta.volume_id) == RanobeVolume.id",
        lazy='noload'
    )

    # @property
    # def timestamp( self ) -> int:
    #     timestamps = [ self._timestamp.timestamp() ]
    #     for chapter in self.chapters:
    #         timestamps.append( chapter.timestamp )
    #     return max( timestamps )

    @property
    def meta(self) -> Dict[str, Any]:
        result = {}
        for _m in self._meta:
            result[ _m.meta_key ] = _m.meta_value
        return result

    # @property
    # def ext(self) -> str:
    #     if not self.filename:
    #         return ''
    #     return self.filename.split('.')[-1]
    
    # @property
    # def download_path(self) -> str:
    #     if not self.filename:
    #         return ''
    #     return '/'.join( [ RANOBE_WEB_PATH, *list( filter( None, [ self.ranobe.path, self.path, self.filename ] ) ) ] )
    
    # @property
    # def fs_path(self) -> str:
    #     if not self.filename:
    #         return ''
    #     return os.path.join( *[ RANOBE_FS_PATH, *list( filter( None, [ self.ranobe.path, self.path, self.filename ] ) ) ] )

    # @property
    # def foldersize(self) -> int:
    #     size = 0

    #     if len( self.chapters ) > 0:
    #         for chapter in self.chapters:
    #             if int( chapter.filesize ) > 0:
    #                 size += int( chapter.filesize )
        
    #     return size


class RanobeChapter(Base):
    __tablename__ = "ranobes_chapters"

    id: Mapped[ int ] =\
        Column(
            "id",
            BigInteger,
            primary_key=True
        )
    volume_id: Mapped[ int ] =\
        Column(
            "volume_id",
            BigInteger,
            ForeignKey( "ranobes_volumes.id", ondelete="cascade" ),
            index=True
        )
    number: Mapped[ float ] =\
        Column(
            "number",
            Float
        )
    title: Mapped[ str ] =\
        Column(
            "title",
            Text,
            default=""
        )

    # rels
    volume: Mapped[ RanobeVolume ] = relationship(
        "RanobeVolume",
        foreign_keys=volume_id,
        remote_side="RanobeVolume.id",
        primaryjoin="foreign(RanobeChapter.volume_id) == RanobeVolume.id",
        lazy='noload',
        viewonly=True,
    )
    
    branches: Mapped[ List[ RanobeChapterBranch ] ] = relationship(
        "RanobeChapterBranch",
        foreign_keys=id,
        remote_side="RanobeChapterBranch.chapter_id",
        primaryjoin="foreign(RanobeChapterBranch.chapter_id) == RanobeChapter.id",
        order_by='RanobeChapterBranch.id.asc()',
        lazy='noload'
    )

    @property
    def volume_number(self) -> float:
        return self.volume.number if self.volume else 0

    def __repr__(
        self
    ) -> str:
        return f'(RanobeChapter id:{self.id}, volume:{self.volume_number}, number:{self.number}, title:{self.title})'


class RanobeChapterBranch(Base):
    __tablename__ = "ranobes_chapters_datas"


    id: Mapped[ int ] =\
        Column(
            "id",
            BigInteger,
            primary_key=True
        )
    branch_id: Mapped[ int ] =\
        Column(
            "branch_id",
            BigInteger,
            ForeignKey( "ranobes_translation_branches.id", ondelete="cascade" ),
            index=True
        )
    chapter_id: Mapped[ int ] =\
        Column(
            "chapter_id",
            BigInteger,
            ForeignKey( "ranobes_chapters.id", ondelete="cascade" ),
            index=True
        )
    content: Mapped[ str ] =\
        Column(
            "content",
            JSON,
            default={}
        )

    branch: Mapped[ RanobeTranslationBranche ] = relationship(
        "RanobeTranslationBranche",
        foreign_keys=branch_id,
        remote_side="RanobeTranslationBranche.id",
        primaryjoin="foreign(RanobeChapterBranch.branch_id) == RanobeTranslationBranche.id",
        lazy='noload',
        viewonly=True,
    )

    def __repr__(
        self
    ) -> str:
        return f'(RanobeChapterBranch chapter_id:{self.chapter_id}, branch:{self.branch_id}, team:{self.branch.team.name})'