from __future__ import annotations

import os
from typing import Self, List, Dict, Any, Callable
from sqlalchemy import select, delete, or_, and_
from sqlalchemy.orm import Session
from app import models

from app.tools import calculate_hash, save_cover

class BaseScaner:

    session: Session

    def chunks_to_n(
        self: Self,
        lst: List[ Any ],
        k: int
    ):
        l = len(lst)
        n = l // k
        for i in range(0, len(lst), n):
            yield lst[i:i + n]


    def saveAuthor(
        self: Self,
        author: str
    ) -> models.Author | None:
        db_author = self.session.execute(
            select(
                models.Author
            )\
            .filter(
                or_(
                    models.Author.name.ilike(author)
                )
            )\
            .limit(1)
        ).scalar_one_or_none()
        if not db_author:
            db_author = models.Author()
            db_author.name = author
            try:
                self.session.add( db_author )
                self.session.commit()
            except:
                db_author = None
        return db_author


    def saveStudio(
        self: Self,
        studio: str
    ) -> models.Studio | None:
        db_studio = self.session.execute(
            select(
                models.Studio
            )\
            .filter(
                or_(
                    models.Studio.name.ilike(studio)
                )
            )\
            .limit(1)
        ).scalar_one_or_none()
        if not db_studio:
            db_studio = models.Studio()
            db_studio.name = studio
            try:
                self.session.add( db_studio )
                self.session.commit()
            except:
                db_studio = None
        return db_studio


    def saveGenre(
        self: Self,
        genre: str
    ) -> models.Genre | None:
        db_genre = self.session.execute(
            select(
                models.Genre
            )\
            .filter(
                or_(
                    models.Genre.name.ilike(genre)
                )
            )\
            .limit(1)
        ).scalar_one_or_none()
        if not db_genre:
            db_genre = models.Genre()
            db_genre.name = genre
            try:
                self.session.add( db_genre )
                self.session.commit()
            except:
                db_genre = None
        return db_genre


    def saveVoice(
        self: Self,
        voice: str
    ) -> models.Voice | None:
        db_voice = self.session.execute(
            select(
                models.Voice
            )\
            .filter(
                or_(
                    models.Voice.name.ilike(voice)
                )
            )\
            .limit(1)
        ).scalar_one_or_none()
        if not db_voice:
            db_voice = models.Voice()
            db_voice.name = voice
            try:
                self.session.add( db_voice )
                self.session.commit()
            except:
                db_voice = None
        return db_voice


    def saveCover(
        self: Self,
        path: str
    ) -> models.Cover | None:
        
        hash = calculate_hash( path )

        db_cover = self.session.execute(
            select(
                models.Cover
            )\
            .filter(
                or_(
                    models.Cover.hash.ilike(hash)
                )
            )\
            .limit(1)
        ).scalar_one_or_none()

        _, ext = os.path.splitext( path )
        filename = f'{hash}{ext}'
        saved = save_cover( path, filename )

        if not db_cover and saved:
            db_cover = models.Cover()
            db_cover.filename = filename
            db_cover.hash = hash
            try:
                self.session.add( db_cover )
                self.session.commit()
            except:
                db_cover = None
        return db_cover