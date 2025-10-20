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
from app.tools import format_float, calculate_hash

from .objects import *

class SingleMangaScaner:

    manga: Manga
    volume_regex: re.Pattern
    chapter_regex: re.Pattern
    image_regex: re.Pattern
    log: logging.Logger

    def __init__(
        self: Self
    ) -> None:
        self.manga = Manga()
        self.volume_regex = re.compile("^(?P<recompressed>r\.)?(?P<volume_name>Volume (?P<volume_number>\d+)).*")
        self.chapter_regex = re.compile("^(?P<recompressed>r\.)?(?P<chapter_name>Chapter (?P<chapter_number>\d+(\.\d+)?))(?P<ext>\.\w+)$")
        self.image_regex = re.compile(".*?(?P<image_number>\d+)(?P<ext>\.\w+)$")


    def run(
        self: Self,
        root_dir: str,
        folder: str
    ) -> Manga:
        logging.basicConfig(
            format=f'%(levelname)s: {folder} %(funcName)s - %(message)s', # %(name)s [%(process)d] - %(asctime)s
            level=logging.INFO
        )
        self.log = logging.getLogger(__name__)
        self.scanMangaFolder( root_dir, folder )

        return self.manga


    def scanMangaFolder(
        self: Self,
        root_dir: str,
        folder: str
    ) -> None:

        scan_path = os.path.join( root_dir, folder )

        self.log.info(f"Started scan {scan_path}")

        self.manga.path = scan_path
        self.manga.folder = folder
        self.manga.name = folder
        self.manga.eng_name = folder
        self.manga.checkCovers()
        self.manga.loadData()
        self.manga.generateSlug()

        scan_results = os.listdir( scan_path )
        scan_results = natsorted( scan_results, alg=ns.IGNORECASE )

        for element in scan_results:

            if os.path.isfile( os.path.join( scan_path, element ) ):
                pass
                # _, ext = os.path.splitext(element)
                # if ext in models.MANGA_EXTS:
                #     self.scanMangaVolumeFile( root_dir=scan_path, file=element )
            else:
                self.scanMangaVolumeFolder( root_dir=scan_path, folder=element )


    def scanMangaVolumeFolder(
        self: Self,
        root_dir: str,
        folder: str
    ):
        scan_path = os.path.join( root_dir, folder )

        self.log.info(f"Started scan {scan_path}")
        volume_data = self.volume_regex.match( folder )

        volume = MangaVolume()
        volume.path = scan_path
        volume.folder = folder
        volume.name = folder.replace("Volume","Том")
        volume.eng_name = folder

        # get data from folder name
        if volume_data:
            volume_name = volume_data.group("volume_name")
            volume_number = volume_data.group("volume_number")
            if volume_name:
                volume.name = volume_name.replace("Volume","Том")
                volume.eng_name = volume_name
            if volume_number:
                volume.number = float( volume_number )

        volume.loadData()
        volume.checkCovers()
        volume.generateSlug()
        volume.loadRC()

        self.manga.volumes[ scan_path ] = volume

        # Scan for chapters and solid volume
        scan_results = os.listdir( scan_path )
        scan_results = natsorted( scan_results, alg=ns.IGNORECASE )

        empty = True

        for element in scan_results:
            _, ext = os.path.splitext( element )

            if os.path.isfile( os.path.join( scan_path, element ) ):
                if ext in models.MANGA_EXTS:
                    if self.chapter_regex.match( element ):
                        self.scanMangaChapterFile( volume=volume, file=element )
                        empty = False
                    elif self.volume_regex.match( element ):
                        volume.filename = element
                        empty = False

        if empty:
            volume.status = 'Ожидается'

        # validatae hashes
        new_hashes = set( [ c.hash for _,c in volume.chapters.items() ] )
        exists_hashes = set( volume.chapters_hashes )

        if exists_hashes != new_hashes:
            volume.chapters_hashes = list( new_hashes )
            if len( volume.chapters ) > 0:
                self.generateSolidVolumeFile( volume )

        if volume.filename:
            # calculate volume size
            size = os.stat( os.path.join( volume.path, volume.filename ) )
            volume.filesize = size.st_size if size else 0
        
        volume.saveRC()


    def scanMangaChapterFile(
        self: Self,
        volume: MangaVolume,
        file: str
    ):
        name, _ = os.path.splitext( file )

        chapter = MangaChapter()
        chapter.filename = file
        chapter.name = name.replace("Chapter","Глава")
        chapter.eng_name = name

        # get data from file name
        chapter_data = self.chapter_regex.match( file )
        if chapter_data:
            chapter_name = chapter_data.group("chapter_name")
            chapter_number = chapter_data.group("chapter_number")
            chapter_recompressed = chapter_data.group("recompressed")
            if chapter_name:
                chapter.name = chapter_name.replace("Chapter","Глава")
                chapter.eng_name = chapter_name
            if chapter_number:
                chapter.number = float( chapter_number )
            if chapter_recompressed:
                chapter.recompressed = True

        # recompress chapter
        if not chapter.recompressed and chapter.filename.endswith('cbz'):
            self.recompressMangaChapterFile( volume, chapter )
        else:
            # skip recompress for non CBZ / already recompressed files
            chapter.recompressed = True

        # calculate chapter size
        size = os.stat( os.path.join( volume.path, chapter.filename ) )
        chapter.filesize = size.st_size if size else 0

        # calculate chapter hash
        path = os.path.join( volume.path, chapter.filename )
        chapter.hash = calculate_hash( path )

        # add to volume chapters
        volume.chapters[ file ] = chapter


    def recompressMangaChapterFile(
        self: Self,
        volume: MangaVolume,
        chapter: MangaChapter
    ) -> None:

        new_chapter_filename = f'r.Chapter {format_float( chapter.number )}.cbz'
        new_chapter_path = os.path.join( volume.path, new_chapter_filename )

        unpack_file = os.path.join( volume.path, chapter.filename )
        unpack_folder = os.path.join( volume.path, f'temp_Chapter {chapter.number}' )

        image_prefix = f'{format_float(volume.number)}-{format_float(chapter.number)}-'


        shutil.rmtree( unpack_folder, ignore_errors=True )
        os.makedirs( unpack_folder, exist_ok=True )


        with zipfile.ZipFile( unpack_file, 'r' ) as z:
            z.extractall( unpack_folder )


        if new_chapter_filename == chapter.filename:
            os.unlink( unpack_file )


        scan_results = os.listdir( unpack_folder )
        scan_results = natsorted( scan_results, alg=ns.IGNORECASE )


        for file in scan_results:
            old_file_path = os.path.join( unpack_folder, file )
            file = file.lower()
            new_file_path = os.path.join( unpack_folder, file )
            try:
                os.rename( old_file_path, new_file_path )
            except:
                pass
            _, ext = os.path.splitext( file )
            if ext not in models.MANGA_IMAGES_EXTS:
                os.unlink( file )
            else:
                matches = self.image_regex.match( file )
                if matches:
                    image_number = int( matches.group('image_number') )
                    new_file_name = f'{image_prefix}{image_number}{ext}'
                    new_file_path = os.path.join( unpack_folder, new_file_name )
                    os.rename( os.path.join( unpack_folder, file ), new_file_path )


        with zipfile.ZipFile( new_chapter_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9 ) as z:
            scan_results = os.listdir( unpack_folder )
            scan_results = natsorted( scan_results, alg=ns.IGNORECASE )
            for file in scan_results:
                z.write( os.path.join( unpack_folder, file ), file )


        shutil.rmtree( unpack_folder, ignore_errors=True )
        if new_chapter_filename != chapter.filename:
            os.unlink( unpack_file )


        chapter.filename = new_chapter_filename


    def generateSolidVolumeFile(
        self: Self,
        volume: MangaVolume
    ) -> None:

        new_volume_filename = f'r.Volume {format_float( volume.number )}.cbz'
        new_volume_path = os.path.join( volume.path, new_volume_filename )

        old_volume_path = os.path.join( volume.path, volume.filename )
        unpack_folder = os.path.join( volume.path, f'temp_Volume {volume.number}' )


        if os.path.exists( old_volume_path ) and os.path.isfile( old_volume_path ):
            os.unlink( old_volume_path )


        if os.path.exists( new_volume_path ) and os.path.isfile( new_volume_path ):
            os.unlink( new_volume_path )


        shutil.rmtree( unpack_folder, ignore_errors=True )
        os.makedirs( unpack_folder, exist_ok=True )


        for _, chapter in volume.chapters.items():
            archive_for_unpack = os.path.join( volume.path, chapter.filename )
            with zipfile.ZipFile( archive_for_unpack, 'r' ) as z:
                z.extractall( unpack_folder )


        with zipfile.ZipFile( new_volume_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9 ) as z:
            scan_results = os.listdir( unpack_folder )
            scan_results = natsorted( scan_results, alg=ns.IGNORECASE )
            for file in scan_results:
                z.write( os.path.join( unpack_folder, file ), file )


        shutil.rmtree( unpack_folder, ignore_errors=True )
        volume.filename = new_volume_filename