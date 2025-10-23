from __future__ import annotations

import os
from typing import List, Dict, Any
from sqlalchemy import Table, Column
from sqlalchemy import SmallInteger, Integer, BigInteger, Float, String, Text, Boolean, Date, DateTime, Computed, JSON, UniqueConstraint, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped
from app.db import Base

DOWNLOADS_FOLDER = 'download'
COVERS_FOLDER    = 'covers'

ANIME_FOLDER     = 'Anime'
MANGA_FOLDER     = 'Manga'
RANOBE_FOLDER    = 'Ranobe'
BOOKS_FOLDER     = 'Books'

DEV_URL = ''


BASE_FS_PATH      = os.path.join( os.path.dirname(__file__).split('app')[0], 'app' )
WEB_FS_PATH       = os.path.join( BASE_FS_PATH, 'web' )
COVERS_FS_PATH    = os.path.join( WEB_FS_PATH, COVERS_FOLDER )
DOWNLOADS_FS_PATH = os.path.join( WEB_FS_PATH, DOWNLOADS_FOLDER )

COVERS_WEB_PATH   = f'{DEV_URL}/{COVERS_FOLDER}'
DOWNLOAD_WEB_PATH = f'{DEV_URL}/{DOWNLOADS_FOLDER}'

ANIME_FS_PATH   = os.path.join( DOWNLOADS_FS_PATH, ANIME_FOLDER )
MANGA_FS_PATH   = os.path.join( DOWNLOADS_FS_PATH, MANGA_FOLDER )
RANOBE_FS_PATH  = os.path.join( DOWNLOADS_FS_PATH, RANOBE_FOLDER )
BOOKS_FS_PATH   = os.path.join( DOWNLOADS_FS_PATH, BOOKS_FOLDER )

ANIME_WEB_PATH  = f'{DOWNLOAD_WEB_PATH}/{ANIME_FOLDER}'
MANGA_WEB_PATH  = f'{DOWNLOAD_WEB_PATH}/{MANGA_FOLDER}'
RANOBE_WEB_PATH = f'{DOWNLOAD_WEB_PATH}/{RANOBE_FOLDER}'
BOOKS_WEB_PATH  = f'{DOWNLOAD_WEB_PATH}/{BOOKS_FOLDER}'


COVERS_EXTS = [ '.jpg', '.jpeg', '.png', '.webp' ]
MANGA_EXTS = [ '.cbz', '.pdf' ]
ANIME_EXTS = [ '.avi', '.mkv', '.mp4' ]
MANGA_IMAGES_EXTS = [ '.jpg', '.jpeg', '.png', '.gif', '.webp' ]

#


class AgeRestriction(Base):
    __tablename__ = "general_age_restrictions"

    id: Mapped[ int ]      = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    title: Mapped[ str ]    = Column(
        "title",
        Text,
        default=""
    )


class ReleaseStatus(Base):
    __tablename__ = "general_release_statuses"

    id: Mapped[ int ]      = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    title: Mapped[ str ]    = Column(
        "title",
        Text,
        default=""
    )


class TranslationStatus(Base):
    __tablename__ = "general_translation_statuses"

    id: Mapped[ int ]      = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    title: Mapped[ str ]    = Column(
        "title",
        Text,
        default=""
    )


class TeamRole(Base):
    __tablename__ = "general_team_roles"

    id: Mapped[ int ]      = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    title: Mapped[ str ]    = Column(
        "title",
        Text,
        default=""
    )

# Base related objects

class Author(Base):
    __tablename__ = "general_authors"

    id: Mapped[ int ]      = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    name: Mapped[ str ]    = Column(
        "name",
        Text,
        default=""
    )
    slug: Mapped[ str ]    = Column(
        "slug",
        Text,
        default=""
    )


class Genre(Base):
    __tablename__ = "general_genres"

    id: Mapped[ int ]      = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    name: Mapped[ str ]    = Column(
        "name",
        Text,
        default=""
    )


class Studio(Base):
    __tablename__ = "general_studios"

    id: Mapped[ int ]      = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    name: Mapped[ str ]    = Column(
        "name",
        Text,
        default=""
    )
    slug: Mapped[ str ]    = Column(
        "slug",
        Text,
        default=""
    )


class Voice(Base):
    __tablename__ = "general_voices"

    id: Mapped[ int ]      = Column(
        "id",
        BigInteger,
        primary_key=True
    )
    name: Mapped[ str ]    = Column(
        "name",
        Text,
        default=""
    )
    slug: Mapped[ str ]    = Column(
        "slug",
        Text,
        default=""
    )


class Image(Base):
    __tablename__ = "general_images"

    id: Mapped[ int ] =\
        Column(
            "id",
            BigInteger,
            primary_key=True
        )
    filename: Mapped[ str ] =\
        Column(
            "filename",
            Text,
            default=""
        )
    
    def __repr__(
        self
    ) -> str:
        return f'(Image id:{self.id}, filename:{self.filename})'
    
    @property
    def fs_path_full(self) -> str:
        if not self.filename:
            return ''
        return os.path.join( COVERS_FS_PATH, 'full', self.filename[0:2], self.filename )
    
    @property
    def fs_path_mini(self) -> str:
        if not self.filename:
            return ''
        return os.path.join( COVERS_FS_PATH, 'mini', self.filename[0:2], self.filename )

    @property
    def cover_link_full(self) -> str:
        # fs_path = self.fs_path_full
        # if not fs_path or not os.path.exists( fs_path ):
        #     return ''
        return f'{COVERS_WEB_PATH}/full/{self.filename[0:2]}/{self.filename}'

    @property
    def cover_link_mini(self) -> str:
        # fs_path = self.fs_path_mini
        # if not fs_path or not os.path.exists( fs_path ):
        #     return ''
        return f'{COVERS_WEB_PATH}/mini/{self.filename[0:2]}/{self.filename}'