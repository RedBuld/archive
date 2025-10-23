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

from app.models.shared import *
from app.models.teams import Team
#

# Авторы
MangaAuthors = Table(
    "_rel_mangas_authors",
    Base.metadata,
    Column(
        "manga_id",
        BigInteger,
        ForeignKey("mangas.id", ondelete="cascade"),
        index=True
    ),
    Column(
        "author_id",
        BigInteger,
        ForeignKey( "general_authors.id", ondelete="cascade" ),
    )
)

# Художники
MangaArtists = Table(
    "_rel_mangas_artists",
    Base.metadata,
    Column(
        "manga_id",
        BigInteger,
        ForeignKey("mangas.id", ondelete="cascade"),
        index=True
    ),
    Column(
        "artist_id",
        BigInteger,
        ForeignKey( "general_authors.id", ondelete="cascade" ),
    )
)

# Жанры
MangaGenres = Table(
    "_rel_mangas_genres",
    Base.metadata,
    Column(
        "manga_id",
        BigInteger,
        ForeignKey("mangas.id", ondelete="cascade"),
        index=True
    ),
    Column(
        "genre_id",
        BigInteger,
        ForeignKey( "general_genres.id", ondelete="cascade" ),
    )
)

# Обложки
class MangaCovers(Base):
    __tablename__ = "_rel_mangas_covers"
    __mapper_args__ = {
        "primary_key": ["manga_id", "volume_id", "image_id"]
    }

    manga_id: Mapped[ int ] =\
        Column(
            "manga_id",
            BigInteger,
            ForeignKey("mangas.id", ondelete="cascade"),
            nullable=True,
            index=True
        )
    volume_id: Mapped[ int ] =\
        Column(
            "volume_id",
            BigInteger,
            ForeignKey('mangas_volumes.id', ondelete="cascade"),
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
class MangaTranslationBranche(Base):
    __tablename__ = "mangas_translation_branches"
    __table_args__ = (
        Index("rtb_mangas_idx", "manga_id"),
        Index("rtb_translator_idx", "manga_id", "team_id"),
    )

    id: Mapped[ int ] =\
        Column(
            "id",
            BigInteger,
            primary_key=True
        )
    manga_id: Mapped[ int ] =\
        Column(
            "manga_id",
            BigInteger,
            ForeignKey( "mangas.id", ondelete="cascade")
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
        primaryjoin="foreign(MangaTranslationBranche.team_id) == Team.id",
        lazy='noload',
        viewonly=True
    )
    
    def __repr__(
        self
    ) -> str:
        return f'(Branch id:{self.id}, manga_id:{self.manga_id}, team_id:{self.team_id})'


#


class MangaMeta(Base):
    __tablename__ = "mangas_meta"

    id: Mapped[ int ] =\
        Column(
            "id",
            BigInteger,
            primary_key=True
        )
    manga_id: Mapped[ int ] =\
        Column(
            "manga_id",
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


class MangaVolumeMeta(Base):
    __tablename__ = "mangas_volumes_meta"

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


#


class Manga(Base):
    __tablename__ = "mangas"
    __table_args__ = (
        Index("m_title_idx", "title", mysql_length=512),
        Index("m_rus_title_idx", "rus_title", mysql_length=512),
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
        secondary=MangaCovers.__tablename__,
        primaryjoin="and_( foreign(MangaCovers.manga_id) == Manga.id, MangaCovers.role=='cover')",
        secondaryjoin="foreign(MangaCovers.image_id) == Image.id",
        order_by='MangaCovers.index.asc()',
        lazy='noload',
        viewonly=True,
    )
    background: Mapped[ Image ] = relationship(
        "Image",
        secondary=MangaCovers.__tablename__,
        primaryjoin="and_( foreign(MangaCovers.manga_id) == Manga.id, MangaCovers.role=='bg')",
        secondaryjoin="foreign(MangaCovers.image_id) == Image.id",
        order_by='MangaCovers.index.asc()',
        lazy='noload',
        viewonly=True,
    )

    # Авторы
    authors: Mapped[ List[ Author ] ] = relationship(
        secondary=MangaAuthors,
        order_by='Author.name.asc()',
        lazy='noload'
    )

    # Художники
    artists: Mapped[ List[ Author ] ] = relationship(
        secondary=MangaArtists,
        order_by='Author.name.asc()',
        lazy='noload'
    )

    # Жанры
    genres: Mapped[ List[ Genre ] ] = relationship(
        secondary=MangaGenres,
        order_by='Genre.name.asc()',
        lazy='noload'
    )

    # Ветки перевода
    branches: Mapped[ List[ MangaTranslationBranche ] ] = relationship(
        "MangaTranslationBranche",
        foreign_keys=id,
        remote_side="MangaTranslationBranche.manga_id",
        primaryjoin="foreign(MangaTranslationBranche.manga_id) == Manga.id",
        order_by='MangaTranslationBranche.id.asc()',
        lazy='noload'
    )
    
    # Тома
    volumes: Mapped[ List[ MangaVolume ] ] = relationship(
        "MangaVolume",
        foreign_keys=id,
        remote_side="MangaVolume.manga_id",
        primaryjoin="foreign(MangaVolume.manga_id) == Manga.id",
        order_by='MangaVolume.number.asc()',
        lazy='noload'
    )

    _meta: Mapped[ List[ MangaMeta ] ] = relationship(
        "MangaMeta",
        remote_side="MangaMeta.manga_id",
        primaryjoin="foreign(MangaMeta.manga_id) == Manga.id",
        lazy='noload'
    )
    
    def __repr__(
        self
    ) -> str:
        return f'(Manga id:{self.id}, title:{self.title})'

    @property
    def cover(self) -> Image|None:
        if len( self.covers ) > 0:
            return self.covers[ 0 ]
        return None

    @property
    def meta(self) -> Dict[str, Any]:
        result = {}
        for _m in self._meta:
            result[_m.meta_key] = _m.meta_value
        return result


class MangaVolume(Base):
    __tablename__ = "mangas_volumes"

    id: Mapped[ int ] =\
        Column(
            "id",
            BigInteger,
            primary_key=True
        )
    manga_id: Mapped[ int ] =\
        Column(
            "manga_id",
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

    manga: Mapped[ Manga ] = relationship(
        "Manga",
        foreign_keys=manga_id,
        remote_side="Manga.id",
        primaryjoin="foreign(MangaVolume.manga_id) == Manga.id",
        lazy='noload',
        viewonly=True,
    )

    cover: Mapped[ Image ] = relationship(
        "Image",
        secondary=MangaCovers.__tablename__,
        primaryjoin="and_( foreign(MangaCovers.manga_id) == Manga.id, foreign(MangaCovers.volume_id) == MangaVolume.id, MangaCovers.role=='cover')",
        secondaryjoin="foreign(MangaCovers.image_id) == Image.id",
        order_by='MangaCovers.index.asc()',
        lazy='noload',
        viewonly=True,
    )
    
    chapters: Mapped[ List[ MangaChapter ] ] = relationship(
        "MangaChapter",
        foreign_keys=id,
        remote_side="MangaChapter.volume_id",
        primaryjoin="foreign(MangaChapter.volume_id) == MangaVolume.id",
        order_by='MangaChapter.number.asc()',
        lazy='noload'
    )

    _meta: Mapped[ List[ MangaVolumeMeta ] ] = relationship(
        "MangaVolumeMeta",
        remote_side="MangaVolumeMeta.volume_id",
        primaryjoin="foreign(MangaVolumeMeta.volume_id) == MangaVolume.id",
        lazy='noload'
    )
    
    def __repr__(
        self
    ) -> str:
        return f'(MangaVolume id:{self.id}, manga:{self.manga_id}, title:{self.title})'

    @property
    def meta(self) -> Dict[str, Any]:
        result = {}
        for _m in self._meta:
            result[ _m.meta_key ] = _m.meta_value
        return result


class MangaChapter(Base):
    __tablename__ = "mangas_chapters"

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
            ForeignKey( "mangas_volumes.id", ondelete="cascade" ),
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
    volume: Mapped[ MangaVolume ] = relationship(
        "MangaVolume",
        foreign_keys=volume_id,
        remote_side="MangaVolume.id",
        primaryjoin="foreign(MangaChapter.volume_id) == MangaVolume.id",
        lazy='noload',
        viewonly=True,
    )
    
    branches: Mapped[ List[ MangaChapterBranch ] ] = relationship(
        "MangaChapterBranch",
        foreign_keys=id,
        remote_side="MangaChapterBranch.chapter_id",
        primaryjoin="foreign(MangaChapterBranch.chapter_id) == MangaChapter.id",
        order_by='MangaChapterBranch.id.asc()',
        lazy='noload'
    )

    def __repr__(
        self
    ) -> str:
        return f'(MangaChapter id:{self.id}, volume:{self.volume_number}, number:{self.number}, title:{self.title})'
    
    @property
    def volume_number(self) -> float:
        return self.volume.number if self.volume else 0


class MangaChapterBranch(Base):
    __tablename__ = "mangas_chapters_datas"


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
            ForeignKey( "mangas_translation_branches.id", ondelete="cascade" ),
            index=True
        )
    chapter_id: Mapped[ int ] =\
        Column(
            "chapter_id",
            BigInteger,
            ForeignKey( "mangas_chapters.id", ondelete="cascade" ),
            index=True
        )

    branch: Mapped[ MangaTranslationBranche ] = relationship(
        "MangaTranslationBranche",
        foreign_keys=branch_id,
        remote_side="MangaTranslationBranche.id",
        primaryjoin="foreign(MangaChapterBranch.branch_id) == MangaTranslationBranche.id",
        lazy='noload',
        viewonly=True,
    )

    def __repr__(
        self
    ) -> str:
        return f'(MangaChapterBranch chapter_id:{self.chapter_id}, branch:{self.branch_id}, team:{self.branch.team.name})'