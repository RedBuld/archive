from __future__ import annotations

import os
import multiprocessing
from typing import Self, List, Dict, Any
from concurrent.futures import ProcessPoolExecutor
from sqlalchemy import func, select, exists, or_, and_
from sqlalchemy.orm import Session
from natsort import natsorted, ns
from app import models
from app import db

from ..base import BaseScaner
from .objects import *
from .scaner import *

def scan_mangas():
    
    scaner = MangaScaner()
    scaner.run()

def scan_mangas_single(name: str):
    
    scaner = MangaScaner()
    scaner.run_single(name)


class MangaScaner(
    BaseScaner
):

    session: Session

    def __init__(
        self: Self
    ) -> None:
        pass
    
    def __run_scaner_instance__(
        self: Self,
        payload: Dict[ str, str]
    ) -> Dict:
        scanner = SingleMangaScaner()
        return scanner.run( payload['root_dir'], payload['folder'] )

    def run(
        self: Self
    ):
        scan_path = models.MANGA_FS_PATH
        scan_results = os.listdir( scan_path )
        scan_results = natsorted( scan_results, alg=ns.IGNORECASE )

        max_processes = multiprocessing.cpu_count()-1
        if max_processes < 1:
            max_processes = 1
        if max_processes > 8:
            max_processes = 8
        
        print(f"Ready {max_processes} runners")
        
        payloads: List[ Dict[ str, str ] ] = []

        for element in scan_results:
            if os.path.isfile( os.path.join( scan_path, element ) ):
                pass
            else:
                payloads.append(
                    {
                        "root_dir":scan_path,
                        "folder":element,
                    }
                )
        
        results: List[ Manga ] = []
        
        with ProcessPoolExecutor(max_workers=max_processes) as runner:
            results = list( runner.map( self.__run_scaner_instance__, payloads ) )
        
        self.save( results )


    def run_single(
        self: Self,
        name: str
    ):
        scan_path = os.path.join( models.MANGA_FS_PATH, name )

        payloads: List[ Dict[ str, str ] ] = []

        if os.path.isfile( scan_path ):
            pass
        else:
            payloads.append(
                {
                    "root_dir":models.MANGA_FS_PATH,
                    "folder":name,
                }
            )
        
        results: List[ Manga ] = []
        
        with ProcessPoolExecutor(max_workers=1) as runner:
            results = list( runner.map( self.__run_scaner_instance__, payloads ) )

        self.save( results )

    
    def save(
        self: Self,
        results: List[ Manga ] = []
    ):
        self.session = db.DB()

        for manga in results:
            db_manga = self.saveManga( manga )
            for _, volume in manga.volumes.items():
                db_volume = self.saveMangaVolume( volume, db_manga )
                for _, chapter in volume.chapters.items():
                    self.saveMangaChapter( chapter, db_volume )
        
        self.session.close()


    def saveManga(
        self: Self,
        manga: Manga
    ) -> models.Manga:

        is_new = False

        # check manga already exists in db
        db_manga = self.session.execute(
            select(
                models.Manga
            )\
            .filter(
                models.Manga.path==manga.folder
            )\
            .limit(1)
        ).scalar_one_or_none()

        if not db_manga:
            is_new = True
            db_manga = models.Manga()

        db_manga.path = manga.folder
        db_manga.name = manga.name
        db_manga.eng_name = manga.eng_name
        db_manga.status = manga.status
        db_manga.slug = manga.slug

        for cover_path in manga.covers:
            cover = self.saveCover( cover_path )
            if cover:
                db_manga.cover_id = cover.id
                break

        self.session.add( db_manga )
        self.session.commit()

        # save manga authors and add to manga
        db_manga.authors.clear()
        self.session.commit()
        for author in manga.authors:
            db_author = self.saveAuthor( author )
            if db_author:
                db_manga.authors.append( db_author )
        self.session.commit()

        # save manga genres and add to manga
        db_manga.genres.clear()
        self.session.commit()
        for genre in manga.genres:
            db_genre = self.saveGenre( genre )
            if db_genre:
                db_manga.genres.append( db_genre )
        self.session.commit()

        # Add notification for new manga 
        if is_new:
            notification = models.Notification()
            notification.action = "new"
            notification.target = "Manga"
            notification.target_id = db_manga.id
            self.session.add( notification )
            self.session.commit()
        
        return db_manga


    def saveMangaVolume(
        self: Self,
        volume: MangaVolume,
        db_manga: models.Manga
    ) -> models.MangaVolume:

        is_new = False

        # check manga volume already exists in db
        db_volume = self.session.execute(
            select(
                models.MangaVolume
            )\
            .filter(
                models.MangaVolume.manga_id==db_manga.id,
                models.MangaVolume.path==volume.folder
            )\
            .limit(1)
        ).scalar_one_or_none()

        if not db_volume:
            is_new = True
            db_volume = models.MangaVolume()

        db_volume.manga_id = db_manga.id
        db_volume.path = volume.folder
        db_volume.number = volume.number
        db_volume.name = volume.name
        db_volume.eng_name = volume.eng_name
        db_volume.status = volume.status
        db_volume.slug = volume.slug
        db_volume.filename = volume.filename
        db_volume.filesize = volume.filesize

        for cover_path in volume.covers:
            cover = self.saveCover( cover_path )
            if cover:
                db_volume.cover_id = cover.id
                break

        self.session.add( db_volume )
        self.session.commit()

        # Add notification for new volume
        if is_new:
            notification = models.Notification()
            notification.action = "new"
            notification.target = "MangaVolume"
            notification.target_id = db_volume.id
            self.session.add( notification )
            self.session.commit()
        
        return db_volume


    def saveMangaChapter(
        self: Self,
        chapter: MangaChapter,
        db_volume: models.MangaVolume
    ) -> models.MangaChapter:

        is_new = False

        # check manga chapter already exists in db
        db_chapter = self.session.execute(
            select(
                models.MangaChapter
            )\
            .filter(
                models.MangaChapter.volume_id==db_volume.id,
                models.MangaChapter.filename==chapter.filename
            )\
            .limit(1)
        ).scalar_one_or_none()

        if not db_chapter:
            is_new = True
            db_chapter = models.MangaChapter()

        db_chapter.volume_id = db_volume.id
        db_chapter.number = chapter.number
        db_chapter.name = chapter.name
        db_chapter.eng_name = chapter.eng_name
        db_chapter.filename = chapter.filename
        db_chapter.filesize = chapter.filesize
        self.session.add( db_chapter )
        self.session.commit()

        # Add notification for new chapter
        # if is_new:
        #     notification = models.Notification()
        #     notification.action = "new"
        #     notification.target = "MangaChapter"
        #     notification.target_id = db_chapter.id
        #     self.session.add( notification )
        #     self.session.commit()