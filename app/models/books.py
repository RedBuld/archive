from __future__ import annotations

from typing import Self, List
from sqlalchemy import func, select, exists, or_, and_
from sqlalchemy import Table, Column
from sqlalchemy import Integer, Float, String, Text, Boolean, Date, DateTime, Computed, JSON, UniqueConstraint, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped
from app.db import DB
from app.db import Base
from .core import *

#


BookAuthorToBook = Table(
    "r_book_author_to_book",
    Base.metadata,
    Column(
        "book_id",
        Integer,
        ForeignKey( "book.id", ondelete="cascade" ),
        primary_key=True
    ),
    Column(
        "author_id",
        Integer,
        ForeignKey( "author.id", ondelete="cascade" ),
        primary_key=True
    )
)


BookGenreToBook = Table(
    "r_book_genre_to_book",
    Base.metadata,
    Column(
        "book_id",
        Integer,
        ForeignKey( "book.id", ondelete="cascade" ),
        primary_key=True
    ),
    Column(
        "genre_id",
        Integer,
        ForeignKey( "book_genre.id", ondelete="cascade" ),
        primary_key=True
    )
)


#


class BookGenre(Base):
    __tablename__ = "book_genre"

    id: Mapped[ int ]      = Column(
        "id",
        Integer,
        primary_key=True
    )
    name: Mapped[ str ]    = Column(
        "name",
        Text,
        default=""
    )

    books: Mapped[ List[ Book ] ] = relationship(
        secondary=BookGenreToBook,
        back_populates="genres"
    )


class BookAuthor(Base):
    __tablename__ = "book_author"

    id: Mapped[ int ]      = Column(
        "id",
        Integer,
        primary_key=True
    )
    name: Mapped[ str ]    = Column(
        "name",
        Text,
        default=""
    )

    books: Mapped[ List[ Book ] ] = relationship(
        secondary=BookAuthorToBook,
        back_populates="authors"
    )


class BookMeta(Base):
    __tablename__ = "book_meta"

    id: Mapped[ int ]         = Column(
        "id",
        Integer,
        primary_key=True
    )
    book_id: Mapped[ int ]    = Column(
        "book_id",
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


class BookSeriaMeta(Base):
    __tablename__ = "book_seria_meta"

    id: Mapped[ int ]         = Column(
        "id",
        Integer,
        primary_key=True
    )
    seria_id: Mapped[ int ]   = Column(
        "seria_id",
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


class Book(Base):
    __tablename__ = "book"
    __covers_folder__ = "book"

    id: Mapped[ int ]             = Column(
        "id",
        Integer,
        primary_key=True
    )
    seria_id: Mapped[ int ]       = Column(
        "seria_id",
        Integer,
        index=True
    )
    seria_number: Mapped[ float ] = Column(
        "number",
        Float
    )
    name: Mapped[ str ]           = Column(
        "name",
        Text,
        default=""
    )
    slug: Mapped[ str ]           = Column(
        "slug",
        Text,
        default=""
    )
    cover_id: Mapped[ int ]       = Column(
        "cover_id",
        Integer,
        nullable=True
    )
    mature: Mapped[ bool ]        = Column(
        "mature",
        Boolean,
        default=False
    )
    # Meta
    status: Mapped[ str ]         = Column(
        "status",
        String(50),
        default=""
    )
    # SYSTEM
    path: Mapped[ str ]           = Column(
        "path",
        Text,
        default=""
    )
    filename: Mapped[ str ]       = Column(
        "filename",
        Text,
        default=""
    )
    filesize: Mapped[ int ]       = Column(
        "filesize",
        Text,
        default="0"
    )

    # rels
    authors: Mapped[ List[ BookAuthor ] ] = relationship(
        secondary=BookAuthorToBook,
        back_populates="books",
        order_by='BookAuthor.name.asc()'
    )

    genres: Mapped[ List[ BookGenre ] ] = relationship(
        secondary=BookGenreToBook,
        back_populates="books",
        order_by='BookGenre.name.asc()'
    )
    
    seria: Mapped[ BookSeria ] = relationship(
        "BookSeria",
        foreign_keys=seria_id,
        remote_side="BookSeria.id",
        primaryjoin="foreign(BookSeria.id) == Book.seria_id",
        viewonly=True,
    )

    meta: Mapped[ List[ BookMeta ] ] = relationship(
        "BookMeta",
        foreign_keys=id,
        remote_side="BookMeta.book_id",
        primaryjoin="foreign(BookMeta.book_id) == Book.id",
    )

    def __repr__( self: Self ) -> str:
        return f'<Book {self.id} - {self.name}>'

    cover: Mapped[ Cover ] = relationship(
        "Cover",
        foreign_keys=cover_id,
        remote_side="Cover.id",
        primaryjoin="foreign(Manga.cover_id) == Cover.id",
        viewonly=True,
    )


class BookSeria(Base):
    __tablename__ = "book_seria"
    __covers_folder__ = "book_seria"

    id: Mapped[ int ]         = Column(
        "id",
        Integer,
        primary_key=True
    )
    name: Mapped[ str ]       = Column(
        "name",
        Text,
        default=""
    )
    slug: Mapped[ str ]       = Column(
        "slug",
        Text,
        default=""
    )
    # Meta
    status: Mapped[ str ]     = Column(
        "status",
        Text,
        default=""
    )

    books: Mapped[ List[ Book ] ] = relationship(
        "Book",
        foreign_keys=id,
        remote_side="Book.seria_id",
        primaryjoin="foreign(BookSeria.id) == Book.seria_id",
        order_by='Book.seria_number.asc()',
    )

    meta: Mapped[ List[ BookSeriaMeta ] ] = relationship(
        "BookSeriaMeta",
        foreign_keys=id,
        remote_side="BookSeriaMeta.seria_id",
        primaryjoin="foreign(BookSeriaMeta.seria_id) == BookSeria.id",
    )

    def __repr__( self: Self ) -> str:
        return f'<BookSeria {self.id} - {self.name}>'
