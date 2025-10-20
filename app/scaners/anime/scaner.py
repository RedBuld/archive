from __future__ import annotations

import re
import os
import logging
import shutil
import zipfile
import hashlib
from typing import Self
from natsort import natsorted, ns
from app import models
from app.tools import format_float

from .objects import *
from ..tools import scan_mediainfo

class SingleAnimeScaner:

    anime: Anime
    season_regex: re.Pattern
    seria_regex: re.Pattern
    log: logging.Logger

    def __init__(
        self: Self
    ) -> None:
        self.anime = Anime()
        self.anime_regex = re.compile("^(?P<anime_name>[^\[]+)")
        self.season_regex = re.compile("^(?P<season_number>\d+(\.\d+)?)\.\s*(?P<season_name>[^\[]+)")
        self.seria_regex = re.compile("^(?P<seria_number>\d+(\.\d+)?)\.?(?P<seria_name>.+)?\.\w+$")

    
    def run_folder(
        self: Self,
        root_dir: str,
        folder: str
    ) -> Anime:
        logging.basicConfig(
            format=f'%(levelname)s: {folder} %(funcName)s - %(message)s', # %(name)s [%(process)d] - %(asctime)s
            level=logging.INFO
        )
        self.log = logging.getLogger(__name__)
        self.scanAnimeFolder( root_dir, folder )

        if len( self.anime.seasons ) > 0:
            ext_voices = []
            ext_studios = []
            ext_genres = []
            for _, season in self.anime.seasons.items():
                for voice in season.voices:
                    ext_voices.append( voice )
                for studio in season.studios:
                    ext_studios.append( studio )
                for genre in season.genres:
                    ext_genres.append( genre )
            self.anime.voices = list( set( [ *self.anime.voices, *ext_voices ] ) )
            self.anime.studios = list( set( [ *self.anime.studios, *ext_studios ] ) )
            self.anime.genres = list( set( [ *self.anime.genres, *ext_genres ] ) )

        return self.anime
    
    def run_file(
        self: Self,
        root_dir: str,
        file: str
    ) -> Anime:
        logging.basicConfig(
            format=f'%(levelname)s: {file} %(funcName)s - %(message)s', # %(name)s [%(process)d] - %(asctime)s
            level=logging.INFO
        )
        self.log = logging.getLogger(__name__)
        self.scanAnimeFile( root_dir, file )

        return self.anime
    
    def scanAnimeFile(
        self: Self,
        root_dir: str,
        file: str
    ) -> None:
        self.log.info(f"Started scan {file}")

        scan_path = os.path.join( root_dir, file )

        size = os.stat( scan_path )

        name, _ = os.path.splitext( file )

        self.anime.path = root_dir
        self.anime.name = name.strip()
        self.anime.eng_name = name.strip()
        self.anime.filename = file
        self.anime.filesize = size.st_size if size else None

        anime_data = self.anime_regex.match( file )
        if anime_data:
            anime_name = anime_data.group('anime_name')
            if anime_name:
                self.anime.name = anime_name.strip()
                self.anime.eng_name = anime_name.strip()

        info = scan_mediainfo( scan_path )
        self.anime.meta.from_mi( info )

        self.anime.checkCovers()
        self.anime.loadData()
        self.anime.generateSlug()


    def scanAnimeFolder(
        self: Self,
        root_dir: str,
        folder: str
    ) -> None:

        scan_path = os.path.join( root_dir, folder )

        self.log.info(f"Started scan {scan_path}")

        self.anime.path = scan_path
        self.anime.folder = folder
        self.anime.name = folder
        self.anime.eng_name = folder

        anime_data = self.season_regex.match( folder )
        if anime_data:
            anime_name = anime_data.group('anime_name')
            if anime_name:
                self.anime.name = anime_name.strip()
                self.anime.eng_name = anime_name.strip()

        self.anime.checkCovers()
        self.anime.loadData()
        self.anime.generateSlug()

        scan_results = os.listdir( scan_path )
        scan_results = natsorted( scan_results, alg=ns.IGNORECASE )

        for element in scan_results:

            if os.path.isfile( os.path.join( scan_path, element ) ):
                _, ext = os.path.splitext(element)
                if ext in models.ANIME_EXTS:
                    self.scanAnimeSeasonFile( root_dir=scan_path, file=element )
            else:
                self.scanAnimeSeasonFolder( root_dir=scan_path, folder=element )


    def scanAnimeSeasonFile(
        self: Self,
        root_dir: str,
        file: str
    ):
        scan_path = os.path.join( root_dir, file )

        self.log.info(f"Started scan {scan_path}")

        name, _ = os.path.splitext( file )

        size = os.stat( os.path.join( root_dir, file ) )
        season_data = self.season_regex.match( file )

        season = AnimeSeason()
        season.path = root_dir
        season.name = name
        season.eng_name = name
        season.filename = file
        season.filesize = size.st_size if size else None

        if season_data:
            season_name = season_data.group("season_name")
            season_number = season_data.group("season_number")
            if season_name:
                season.name = season_name.replace("Season","Сезон").strip()
                season.eng_name = season_name.strip()
            if season_number:
                season.number = float( season_number )

        info = scan_mediainfo( scan_path )
        season.meta.from_mi( info )

        season.loadData()
        season.checkCovers()
        season.generateSlug()

        self.anime.seasons[ scan_path ] = season


    def scanAnimeSeasonFolder(
        self: Self,
        root_dir: str,
        folder: str
    ):
        scan_path = os.path.join( root_dir, folder )

        self.log.info(f"Started scan {scan_path}")

        season_data = self.season_regex.match( folder )

        season = AnimeSeason()
        season.path = scan_path
        season.folder = folder.strip()
        season.name = folder.replace("Season","Сезон").replace("part","часть").strip()
        season.eng_name = folder

        # get data from folder name
        if season_data:
            season_name = season_data.group("season_name")
            season_number = season_data.group("season_number")
            if season_name:
                season.name = season_name.replace("Season","Сезон").replace("part","часть").strip()
                season.eng_name = season_name.strip()
            if season_number:
                season.number = float( season_number )

        season.loadData()
        season.checkCovers()
        season.generateSlug()

        self.anime.seasons[ scan_path ] = season

        # Scan for series and solid season
        scan_results = os.listdir( scan_path )
        scan_results = natsorted( scan_results, alg=ns.IGNORECASE )

        for element in scan_results:
            _, ext = os.path.splitext( element )

            if os.path.isfile( os.path.join( scan_path, element ) ):
                if ext in models.ANIME_EXTS:
                    if self.seria_regex.match( element ):
                        self.scanAnimeSeriaFile( season=season, file=element )
                    elif self.season_regex.match( element ):
                        season.filename = element
        
        if len( season.series ) > 0:
            composite = CompositeMeta()
            for _, seria in season.series.items():
                composite.from_meta( seria.meta )
            
            season.meta.from_composite( composite )


    def scanAnimeSeriaFile(
        self: Self,
        season: AnimeSeason,
        file: str
    ):
        name, _ = os.path.splitext( file )

        scan_path = os.path.join( season.path, file )

        self.log.info(f"Started scan {season.path}\{file}")

        seria = AnimeSeria()
        seria.filename = file
        seria.name = name.replace("Seria","Серия").strip()
        seria.eng_name = name.strip()

        # get data from file name
        seria_data = self.seria_regex.match( file )
        if seria_data:
            seria_name = seria_data.group("seria_name")
            seria_number = seria_data.group("seria_number")
            if seria_name:
                seria.name = seria_name.replace("Seria","Серия").strip()
                seria.eng_name = seria_name.strip()
            if seria_number:
                seria.number = float( seria_number )
        
        seria_number = format_float(seria.number)
        if seria_number in season.series_names:
            seria_names = season.series_names[ seria_number ]
            if 'name' in seria_names and seria_names['name']:
                seria.name = seria_names['name']
            if 'eng_name' in seria_names and seria_names['eng_name']:
                seria.eng_name = seria_names['eng_name']

        info = scan_mediainfo( scan_path )
        seria.meta.from_mi( info )

        # calculate seria size
        size = os.stat( os.path.join( season.path, seria.filename ) )
        seria.filesize = size.st_size if size else 0

        # add to season series
        season.series[ file ] = seria