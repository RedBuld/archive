from __future__ import annotations

import os
import multiprocessing
from typing import Self, List, Dict, Any, Callable
from concurrent.futures import ProcessPoolExecutor
from sqlalchemy import select, delete, or_, and_
from sqlalchemy.orm import Session
from natsort import natsorted, ns
from app import models
from app import db

from ..base import BaseScaner
from .objects import *
from .scaner import *

def scan_animes():
    
    scaner = AnimeScaner()
    scaner.run()

def scan_animes_single(name: str):
    
    scaner = AnimeScaner()
    scaner.run_single(name)


class AnimeScaner(
    BaseScaner
):

    def __init__(
        self: Self
    ) -> None:
        pass
    
    def __run_scaner_instance__(
        self: Self,
        payload: Dict[ str, str]
    ) -> Dict:
        scanner = SingleAnimeScaner()
        if 'folder' in payload:
            return scanner.run_folder( payload['root_dir'], payload['folder'] )
        elif 'file' in payload:
            return scanner.run_file( payload['root_dir'], payload['file'] )

    def run(
        self: Self
    ):
        scan_path = models.ANIME_FS_PATH
        scan_results = os.listdir( scan_path )
        scan_results = natsorted( scan_results, alg=ns.IGNORECASE )

        max_processes = multiprocessing.cpu_count()-1
        if max_processes < 1:
            max_processes = 1
        if max_processes > 8:
            max_processes = 8
        
        payloads: List[ Dict[ str, str ] ] = []

        for element in scan_results:
            if os.path.isfile( os.path.join( scan_path, element ) ):
                _, ext = os.path.splitext( element )
                if ext in models.ANIME_EXTS:
                    payloads.append(
                        {
                            "root_dir":scan_path,
                            "file":element,
                        }
                    )
            else:
                payloads.append(
                    {
                        "root_dir":scan_path,
                        "folder":element,
                    }
                )
        
        results: List[ Anime ] = []
        
        with ProcessPoolExecutor(max_workers=max_processes) as runner:
            results = list( runner.map( self.__run_scaner_instance__, payloads ) )

        self.save( results )


    def run_single(
        self: Self,
        name: str
    ):
        scan_path = os.path.join( models.ANIME_FS_PATH, name )

        payloads: List[ Dict[ str, str ] ] = []

        if os.path.isfile( scan_path ):
            _, ext = os.path.splitext( scan_path )
            if ext in models.ANIME_EXTS:
                payloads.append(
                    {
                        "root_dir":models.ANIME_FS_PATH,
                        "file":name,
                    }
                )
        else:
            payloads.append(
                {
                    "root_dir":models.ANIME_FS_PATH,
                    "folder":name,
                }
            )
        
        results: List[ Anime ] = []
        
        with ProcessPoolExecutor(max_workers=1) as runner:
            results = list( runner.map( self.__run_scaner_instance__, payloads ) )

        self.save( results )


    # 

    
    def save(
        self: Self,
        results: List[ Anime ] = []
    ):
        self.session = db.DB()

        for anime in results:
            db_anime = self.saveAnime( anime )
            for _, season in anime.seasons.items():
                db_season = self.saveAnimeSeason( season, db_anime )
                for _, seria in season.series.items():
                    self.saveAnimeSeria( seria, db_season )
        
        self.session.close()


    def saveAnime(
        self: Self,
        anime: Anime
    ) -> models.Anime:

        print(f"Saving {anime.name}")

        is_new = False

        # check anime already exists in db
        db_anime = self.session.execute(
            select(
                models.Anime
            )\
            .filter(
                models.Anime.path==anime.folder,
                models.Anime.filename==anime.filename
            )\
            .limit(1)
        ).scalar_one_or_none()

        if not db_anime:
            is_new = True
            db_anime = models.Anime()

        db_anime.path = anime.folder
        db_anime.filename = anime.filename
        db_anime.name = anime.name
        db_anime.eng_name = anime.eng_name
        db_anime.slug = anime.slug
        db_anime.filename = anime.filename
        db_anime.filesize = anime.filesize

        for cover_path in anime.covers:
            cover = self.saveCover( cover_path )
            if cover:
                db_anime.cover_id = cover.id
                break

        self.session.add( db_anime )
        self.session.commit()

        self.saveAnimeMeta( db_anime, anime.meta )

        # save anime voices and add to anime
        db_anime.voices.clear()
        self.session.commit()
        for voice in anime.voices:
            db_voice = self.saveVoice( voice )
            if db_voice:
                db_anime.voices.append( db_voice )
        self.session.commit()
        self.session.refresh(db_anime)

        # save anime studios and add to anime
        db_anime.studios.clear()
        self.session.commit()
        for studio in anime.studios:
            db_studio = self.saveStudio( studio )
            if db_studio:
                db_anime.studios.append( db_studio )
        self.session.commit()

        # save anime genres and add to anime
        db_anime.genres.clear()
        self.session.commit()
        for genre in anime.genres:
            db_genre = self.saveGenre( genre )
            if db_genre:
                db_anime.genres.append( db_genre )
        self.session.commit()

        # Add notification for new anime 
        if is_new:
            notification = models.Notification()
            notification.action = "new"
            notification.target = "Anime"
            notification.target_id = db_anime.id
            self.session.add( notification )
            self.session.commit()
        
        return db_anime


    def saveAnimeSeason(
        self: Self,
        season: AnimeSeason,
        db_anime: models.Anime
    ) -> models.AnimeSeason:
        
        print(f"Saving {db_anime.name} - {season.name}")

        is_new = False

        # check anime season already exists in db
        db_season = self.session.execute(
            select(
                models.AnimeSeason
            )\
            .filter(
                models.AnimeSeason.anime_id==db_anime.id,
                models.AnimeSeason.path==season.folder,
                models.AnimeSeason.filename==season.filename
            )\
            .limit(1)
        ).scalar_one_or_none()

        if not db_season:
            is_new = True
            db_season = models.AnimeSeason()

        db_season.anime_id = db_anime.id
        db_season.path = season.folder
        db_season.number = season.number
        db_season.name = season.name
        db_season.eng_name = season.eng_name
        db_season.slug = season.slug
        db_season.filename = season.filename
        db_season.filesize = season.filesize

        for cover_path in season.covers:
            cover = self.saveCover( cover_path )
            if cover:
                db_season.cover_id = cover.id

        self.session.add( db_season )
        self.session.commit()

        self.saveAnimeSeasonMeta( db_season, season.meta )

        # save voices and add to season
        db_season.voices.clear()
        self.session.commit()
        for voice in season.voices:
            db_voice = self.saveVoice( voice )
            if db_voice:
                db_season.voices.append( db_voice )
        self.session.commit()

        # save studios and add to season
        db_season.studios.clear()
        self.session.commit()
        for studio in season.studios:
            db_studio = self.saveStudio( studio )
            if db_studio:
                db_season.studios.append( db_studio )
        self.session.commit()

        # save genres and add to season
        db_season.genres.clear()
        self.session.commit()
        for genre in season.genres:
            db_genre = self.saveGenre( genre )
            if db_genre:
                db_season.genres.append( db_genre )
        self.session.commit()

        # Add notification for new season
        if is_new:
            notification = models.Notification()
            notification.action = "new"
            notification.target = "AnimeSeason"
            notification.target_id = db_season.id
            self.session.add( notification )
            self.session.commit()
        
        return db_season


    def saveAnimeSeria(
        self: Self,
        seria: AnimeSeria,
        db_season: models.AnimeSeason
    ) -> models.AnimeSeria:
        
        print(f"Saving {db_season.anime.name} - {db_season.name} - {seria.name}")

        is_new = False

        # check anime seria already exists in db
        db_seria = self.session.execute(
            select(
                models.AnimeSeria
            )\
            .filter(
                models.AnimeSeria.season_id==db_season.id,
                models.AnimeSeria.filename==seria.filename
            )\
            .limit(1)
        ).scalar_one_or_none()

        if not db_seria:
            is_new = True
            db_seria = models.AnimeSeria()

        db_seria.season_id = db_season.id
        db_seria.number = seria.number
        db_seria.name = seria.name
        db_seria.eng_name = seria.eng_name
        db_seria.filename = seria.filename
        db_seria.filesize = seria.filesize
        self.session.add( db_seria )
        self.session.commit()

        self.saveAnimeSeriaMeta( db_seria, seria.meta )

        # Add notification for new seria
        # if is_new:
        #     notification = models.Notification()
        #     notification.action = "new"
        #     notification.target = "AnimeSeria"
        #     notification.target_id = db_seria.id
        #     self.session.add( notification )
        #     self.session.commit()




    def saveAnimeMeta(
        self: Self,
        db_anime: models.Anime,
        meta: Meta
    ) -> None:
        
        for key in meta._fields_:

            value = getattr( meta, key, None )

            if not value:
                self.session.execute(
                    delete(
                        models.AnimeMeta
                    )\
                    .where(
                        models.AnimeMeta.anime_id==db_anime.id,
                        models.AnimeMeta.meta_key==key
                    )
                )
            else:
                db_meta = self.session.execute(
                    select(
                        models.AnimeMeta
                    )\
                    .filter(
                        models.AnimeMeta.anime_id==db_anime.id,
                        models.AnimeMeta.meta_key==key
                    )\
                    .limit(1)
                ).scalar_one_or_none()
                if not db_meta:
                    db_meta = models.AnimeMeta()
                db_meta.anime_id = db_anime.id
                db_meta.meta_key = key
                db_meta.meta_value = value
                self.session.add( db_meta )
        self.session.commit()


    def saveAnimeSeasonMeta(
        self: Self,
        db_season: models.AnimeSeason,
        meta: Meta
    ) -> None:
        for key in meta._fields_:

            value = getattr( meta, key, None )

            if not value:
                self.session.execute(
                    delete(
                        models.AnimeSeasonMeta
                    )\
                    .where(
                        models.AnimeSeasonMeta.season_id==db_season.id,
                        models.AnimeSeasonMeta.meta_key==key
                    )
                )
            else:
                db_meta = self.session.execute(
                    select(
                        models.AnimeSeasonMeta
                    )\
                    .filter(
                        models.AnimeSeasonMeta.season_id==db_season.id,
                        models.AnimeSeasonMeta.meta_key==key
                    )\
                    .limit(1)
                ).scalar_one_or_none()
                if not db_meta:
                    db_meta = models.AnimeSeasonMeta()
                db_meta.season_id = db_season.id
                db_meta.meta_key = key
                db_meta.meta_value = value
                self.session.add( db_meta )
        self.session.commit()


    def saveAnimeSeriaMeta(
        self: Self,
        db_seria: models.AnimeSeria,
        meta: Meta
    ) -> None:
        for key in meta._fields_:

            value = getattr( meta, key, None )

            if not value:
                self.session.execute(
                    delete(
                        models.AnimeSeriaMeta
                    )\
                    .where(
                        models.AnimeSeriaMeta.seria_id==db_seria.id,
                        models.AnimeSeriaMeta.meta_key==key
                    )
                )
            else:
                db_meta = self.session.execute(
                    select(
                        models.AnimeSeriaMeta
                    )\
                    .filter(
                        models.AnimeSeriaMeta.seria_id==db_seria.id,
                        models.AnimeSeriaMeta.meta_key==key
                    )\
                    .limit(1)
                ).scalar_one_or_none()
                if not db_meta:
                    db_meta = models.AnimeSeriaMeta()
                db_meta.seria_id = db_seria.id
                db_meta.meta_key = key
                db_meta.meta_value = value
                self.session.add( db_meta )
        self.session.commit()